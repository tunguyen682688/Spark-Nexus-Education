import { Query } from '@nestjs/cqrs';

export class GetUserCertificatesQuery extends Query<any> {
  constructor(public readonly userId: string) {
    super();
  }
}
