export type PresignFileInput = {
  file_name: string;       // required
  mime_type: string;       // required
  file_size_bytes: number; // required, min: 1, max: 26214400 (25MB)
};

export type PresignBillResult = {
  upload_url: string;
  object_key: string;
  file_name: string;
};

export type UseGetPresignURLInput = {
    txId: string;
    bills: PresignFileInput[];
};

export type ConfirmBillInput = {
  object_key: string;        // required
  file_name: string;         // required
  mime_type: string;         // required
  file_size_bytes: number;   // required
};