import * as iam from 'aws-cdk-lib/aws-iam';
import * as blueprints from '@aws-quickstart/eks-blueprints';

export class TeamPlatform extends blueprints.PlatformTeam {
    constructor(account: string) {
        super({
            name: 'Platform',
            users: [
                new iam.ArnPrincipal(`arn:aws:iam::${account}:user/platform`),
                new iam.ArnPrincipal(`arn:aws:iam::${account}:user/rdurvasula`)
            ]
        });
    }
}