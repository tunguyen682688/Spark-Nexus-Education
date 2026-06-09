import { ICommand } from '@nestjs/cqrs';

export class SyncUserCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly name?: string | null,
    public readonly picture?: string | null,
    public readonly role?: string
  ) {}
}
