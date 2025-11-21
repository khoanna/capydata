export interface Asset {
  id: {
    id: string;
  };
  title: string;
  blob_id: string;
  description: string;
  filename: string;
  filetype: string;
  on_listed: boolean;
  amount_sold: number;
  owner: string;
  price: number;
  release_date: number;
  tags: string[];
}
