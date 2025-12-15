import { User } from 'generated/prisma/client';

export interface IGoogleProfile {
  id: string;
  displayName: string;
  name: {
    familyName: string;
    givenName: string;
  };
  emails: Array<{
    value: string;
    verified: boolean;
  }>;
  photos: Array<{
    value: string;
  }>;
}

export interface IGithubProfile {
  id: string;
  nodeId: string;
  displayName: string | null;
  username: string;
  profileUrl: string;
  photos: Array<{
    value: string;
  }>;
  emails: Array<{
    value: string;
  }>;
  avatar_url: string;
}

export interface IAppleProfile {
  email: string;
  firstName?: string;
  lastName?: string;
  accessToken: string;
}

export interface ITwitchProfile {
  id: string;
  login: string;
  display_name: string;
  type: string;
  broadcaster_type: string;
  description: string;
  profile_image_url: string;
  offline_image_url: string;
  view_count: number;
  email: string;
}

export interface IYandexProfile {
  id: string;
  username: string;
  displayName: string;
  name: {
    familyName: string;
    givenName: string;
  };
  gender: string | null;
  emails: Array<{
    value: string;
  }>;
  photos: Array<{
    value: string;
    type: string;
  }>;
}
export interface ITelegramProfile {
  id: string;
  username?: string;
  firstName: string;
  lastName?: string;
  photoUrl?: string;
  authDate: number;
  hash: string;
}

export type TUserSocial = Partial<
  Pick<User, 'email' | 'name' | 'avatarPath' | 'phone' | 'telegramId'>
>;

export type TSocialCallback = (
  error: any,
  user: TUserSocial,
  info?: any,
) => void;
