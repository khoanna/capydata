import {
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
} from "@mysten/dapp-kit";
import {walrus, WalrusFile} from "@mysten/walrus";

const suiClient = useSuiClient().$extend(
  walrus({
    storageNodeClientOptions: {
      onError: (error) => console.log(error),
    },
  })
);
const address = useCurrentAccount()?.address || "";
const {mutateAsync: signAndExecuteTransaction} = useSignAndExecuteTransaction();

export const uploadFileToWalrus = async (file: File) : Promise<string> => {
  const flow = suiClient.walrus.writeFilesFlow({
    files: [
      WalrusFile.from({
        contents: new Uint8Array(await file.arrayBuffer()),
        identifier: file.name,
      }),
    ],
  });
  await flow.encode();
  const registerTx = flow.register({
    epochs: 3,
    owner: address,
    deletable: true,
  });
  const {digest} = await signAndExecuteTransaction({transaction: registerTx});
  await flow.upload({digest});
  const certifyTx = flow.certify();
  await signAndExecuteTransaction({transaction: certifyTx});
  const files = await flow.listFiles();
  return files[0].blobId;
};

export const fetchBlobFromWalrus = async (blobId: string) : Promise<Uint8Array> => {
  const [file] = await suiClient.walrus.getFiles({ids: [blobId]});
  const bytes = await file.bytes();
  return bytes;
}