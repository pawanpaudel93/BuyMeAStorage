type T_addr = string;
type T_txid = string;
type T_walletName = "arconnect" | "webwallet" | "bundlr";

type T_profile = {
  addr: T_addr;
  handle?: string;
  name?: string;
  bio?: string;
  links: {
    twitter?: string;
    discord?: string;
    github?: string;
    instagram?: string;
    facebook?: string;
  };
  avatar?: T_txid;
};

export type { T_addr, T_txid, T_walletName, T_profile };

export interface ISupport {
  name: string;
  description: string;
  storageUnit: string;
  storageValue: number;
  supporter: string;
}

export interface IPost {
  id?: string;
  link?: string;
  title: string;
  description: string;
  content: string;
  topics: string[] | string;
  type?: string;
  preview?: string;
  isAccess?: boolean;
  contentType?: string;
  published?: string;
  license?: ITag[];
}

export interface ITag {
  name: string;
  value: string;
}
