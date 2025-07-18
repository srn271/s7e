import { JsonProperty } from '../decorators/json-property';

export class User {

  @JsonProperty({ type: String })
  public name: string;

  @JsonProperty({ type: Number })
  public age: number;

  @JsonProperty({ type: String, optional: true })
  public nickname?: string;

  @JsonProperty({ type: Boolean, optional: false })
  public active: boolean;

  // Not serializable properties
  public password: string;
  public internalId: number;

  constructor();
  constructor(
    name: string,
    age: number,
    password?: string,
    internalId?: number,
    nickname?: string,
    active?: boolean
  );
  constructor(
    name?: string,
    age?: number,
    password?: string,
    internalId?: number,
    nickname?: string,
    active?: boolean
  ) {
    this.name = name ?? '';
    this.age = age ?? 0;
    this.nickname = nickname;
    this.active = active ?? true;
    this.password = password ?? '';
    this.internalId = internalId ?? 0;
  }
}
