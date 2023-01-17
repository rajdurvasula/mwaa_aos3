import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as blueprints from '@aws-quickstart/eks-blueprints';
import * as eks from 'aws-cdk-lib/aws-eks';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { MyVpcResourceProvider } from '../resources/my-vpc';
import { PlatformTeam } from '@aws-quickstart/eks-blueprints';
import { TeamPlatform } from '../teams/platform-team';
import * as path from 'path';
import * as fs from 'fs';
import * as iam from 'aws-cdk-lib/aws-iam';

export class MwaaAos3Stack extends cdk.Stack {

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const account = cdk.Stack.of(this).account;
    const region = cdk.Stack.of(this).region;
/*
    const myFargateProfiles: Map<string, eks.FargateProfileOptions> = new Map([
      [ "fargate", { selectors: [ { namespace: "eks-fargate" } ]}]
    ]);

    const fargateClusterProvider = new blueprints.FargateClusterProvider({
      fargateProfiles: myFargateProfiles,
      version: eks.KubernetesVersion.V1_23
    });
*/
    const genClusterProvider = new blueprints.GenericClusterProvider({
      version: eks.KubernetesVersion.V1_23,
      fargateProfiles: {
        "fargate": {
          selectors: [
            {
              namespace: "eks-fargate"
            }
          ]
        }
      },
      managedNodeGroups: [
        {
          amiType: eks.NodegroupAmiType.AL2_X86_64,
          id: "emr-ng",
          desiredSize: 2,
          diskSize: 30,
          instanceTypes: [
            ec2.InstanceType.of(ec2.InstanceClass.C3, ec2.InstanceSize.LARGE),
            ec2.InstanceType.of(ec2.InstanceClass.M5, ec2.InstanceSize.LARGE),
          ],
          maxSize: 2,
          minSize: 2,
          nodeGroupCapacityType: eks.CapacityType.SPOT
        }
      ],
      outputClusterName: true,
      outputConfigCommand: true,
      outputMastersRoleArn: true
    });

    // emr job exec policy
    const emrJobExecPolicy: iam.PolicyStatement[] = [
      new iam.PolicyStatement({
        resources: ['*'],
        actions: ['s3:*'],
      }),
      new iam.PolicyStatement({
        resources: ['*'],   
        actions: ['glue:*'],
      }),
      new iam.PolicyStatement({
        resources: ['*'],
        actions: [
          'logs:*',
        ],
      }),
    ];
    // EmrEksTeamProps
    const emrEksTeamProps: blueprints.EmrEksTeamProps = {
      name: 'emrDataTeam',
      virtualClusterName: 'rd-cluster',
      virtualClusterNamespace: 'spark',
      createNamespace: true,
      users: [
        new iam.ArnPrincipal(`arn:aws:iam::${account}:user/rdurvasula`)
      ],
      executionRoles: [
        {
          executionRoleIamPolicyStatement: emrJobExecPolicy,
          executionRoleName: 'emr-containers-jobexec-role'
        }
      ]
    };

    const eksStack = blueprints.EksBlueprint.builder()
    .account(account)
    .addOns(new blueprints.AwsLoadBalancerControllerAddOn, new blueprints.EmrEksAddOn)
    .clusterProvider(genClusterProvider)
    .region(region)
    .resourceProvider(blueprints.GlobalResources.Vpc, new MyVpcResourceProvider())
    .teams(new TeamPlatform(account), new blueprints.EmrEksTeam(emrEksTeamProps))
    .build(this, 'rd-cluster');

  }
}
