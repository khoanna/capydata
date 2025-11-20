import {useState} from "react";
import useSeal from "./useSeal";
import useWalrus from "./useWalrus";

export default function useMarketplace() {
  const [loading, setLoading] = useState(false);
  const {encrypt, decrypt} = useSeal();
  const {uploadFileToWalrus, fetchBlobFromWalrus} = useWalrus();

  const uploadFile = async (file: File, title: string, filename: string, filetype: string, description: string, tags: string[], price: number, release_date: number) => {
    setLoading(true);
    try {
      const encryptedBytes = await encrypt(
        new Uint8Array(await file.arrayBuffer())
      );
      const blobId = await uploadFileToWalrus(encryptedBytes, file.name);
      // more logic can be added here if needed
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getFile = async (
    blobId: string,
    filename: string,
    filetype: string
  ) => {
    setLoading(true);
    try {
      const encryptedBytes = await fetchBlobFromWalrus(blobId);
      const decryptedBytes = await decrypt(encryptedBytes);
      const Uint8ArrayBytes = new Uint8Array(decryptedBytes);
      const file = new File([Uint8ArrayBytes], filename, {type: filetype});
      return file;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    uploadFile,
    getFile,
  };
}
