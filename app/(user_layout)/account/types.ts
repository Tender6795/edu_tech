export type AccountFormValues = {
  firstName: string | null;
  lastName: string | null;
  avatar_url: string | null;
  skillIds?: string[]
};

export type AlertProps = {
  message: string;
  severity?: string;
};

export type AvatarUrl = string | null | undefined;

export type AvatarProps = {
  url: AvatarUrl;
  // userName: string
};
