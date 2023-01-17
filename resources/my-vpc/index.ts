import * as cdk from 'aws-cdk-lib';
import { IVpc, Vpc } from 'aws-cdk-lib/aws-ec2';
import * as blueprints from '@aws-quickstart/eks-blueprints';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

export class MyVpcResourceProvider implements blueprints.ResourceProvider<IVpc> {
    provide(context: blueprints.ResourceContext): IVpc {
        const scope = context.scope;
        return new MyVpc(scope, 'my-vpc-construct').myVpc;
    }
}

export class MyVpc extends Construct {

    public readonly myVpc: ec2.Vpc;

    constructor(scope: Construct, id: string) {
        super(scope, id);
        this.myVpc = new Vpc(scope, 'my-vpc', {
            availabilityZones: cdk.Stack.of(this).availabilityZones.sort().slice(0,2),
            enableDnsHostnames: true,
            enableDnsSupport: true,
            ipAddresses: ec2.IpAddresses.cidr('192.168.0.0/16'),
            subnetConfiguration: [
                {
                    cidrMask: 20,
                    name: 'pub',
                    subnetType: ec2.SubnetType.PUBLIC
                },
                {
                    cidrMask: 20,
                    name: 'priv',
                    subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS
                }
            ],
            gatewayEndpoints: {
                S3: {
                    service: ec2.GatewayVpcEndpointAwsService.S3
                }
            }
        });
        // ECR API endpoint
        this.myVpc.addInterfaceEndpoint('EcrApiEndpoint', {
            service: ec2.InterfaceVpcEndpointAwsService.ECR
        });
        // ECR DKR endpoint
        this.myVpc.addInterfaceEndpoint('EcrDkrEndpoint', {
            service: ec2.InterfaceVpcEndpointAwsService.ECR_DOCKER
        });
        // EC2 endpoint
        this.myVpc.addInterfaceEndpoint('Ec2Endpoint', {
            service: ec2.InterfaceVpcEndpointAwsService.EC2
        });
        // CWLogs endpoint
        this.myVpc.addInterfaceEndpoint('CWLogsEndpoint', {
            service: ec2.InterfaceVpcEndpointAwsService.CLOUDWATCH_LOGS
        });
        // STS endpoint
        this.myVpc.addInterfaceEndpoint('STSEndpoint', {
            service: ec2.InterfaceVpcEndpointAwsService.STS
        });
        // ALB endpoint
        this.myVpc.addInterfaceEndpoint('ALBEndpoint', {
            service: ec2.InterfaceVpcEndpointAwsService.ELASTIC_LOAD_BALANCING
        });
        // SSM endpoint
        this.myVpc.addInterfaceEndpoint('SSMEndpoint', {
            service: ec2.InterfaceVpcEndpointAwsService.SSM
        });
        // SSMMessages endpoint
        this.myVpc.addInterfaceEndpoint('SSMMessagesEndpoint', {
            service: ec2.InterfaceVpcEndpointAwsService.SSM_MESSAGES
        });
    }
}