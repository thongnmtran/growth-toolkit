import { UserSession } from '../../models';

export type AgentAuthRequest = {
  username: string;
  password: string;
};

export type AgentAuthResponse = UserSession;
