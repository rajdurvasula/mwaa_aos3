import * as iam from 'aws-cdk-lib/aws-iam';
import * as blueprints from '@aws-quickstart/eks-blueprints';

export class EmrTeam extends blueprints.EmrEksTeam {
    constructor(props: blueprints.EmrEksTeamProps) {
        super(props);
    }
}