# CDK TypeScript project to setup AMWAA, EMR on EKS, AOS

This CDK project will deploy following AWS Services/Resources in `us-east-1` AWS region:
- VPC
- EKS Cluster
  - `PlatformTeam` with Cluster Admin RBAC role
  - `EmrEksTeam` with RBAC role for launching virtual cluster on EKS
- EMR virtual cluster

## Modules/Libraries
- AWS CDK EKS blueprints
- AWS CDK

## Manual steps for EMR Job launch
- From IAM Console, get `EMR Job Execution Role ARN` created by this project
  - Name: `emr-containers-jobexec-role-us-east-1-rd-cluster`
- Update Trust Policy for EMR Containers to run in EKS namespace

```
aws emr-containers update-role-trust-policy --cluster-name rd-cluster --namespace spark --role-name emr-containers-jobexec-role-us-east-1-rd-cluster
```

### Launch EMR job (sample job: Spark Pi)

```
export ACCOUNT_ID=466323227181
export AWS_REGION=us-east-1
export EMR_ROLE_ARN=arn:aws:iam::466323227181:role/emr-containers-jobexec-role-us-east-1-rd-cluster
aws emr-containers start-job-run --virtual-cluster-id=$VIRTUAL_CLUSTER_ID --name=pi-2 --execution-role-arn=$EMR_ROLE_ARN --release-label=emr-6.8.0-latest --job-driver='{
"sparkSubmitJobDriver": {
"entryPoint": "local:///usr/lib/spark/examples/src/main/python/pi.py",
"sparkSubmitParameters": "--conf spark.executor.instances=1 --conf spark.executor.memory=2G --conf spark.executor.cores=1 --conf spark.driver.cores=1"
}
}'
```

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `cdk deploy`      deploy this stack to your default AWS account/region
* `cdk diff`        compare deployed stack with current state
* `cdk synth`       emits the synthesized CloudFormation template
