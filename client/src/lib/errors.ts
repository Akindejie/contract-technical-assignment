export type EthersError = {
  message?: string;
  data?: { message?: string };
};

export function extractErrorMessage(error: unknown): string {
  if (error && typeof error === 'object') {
    if (
      'message' in error &&
      typeof (error as EthersError).message === 'string'
    ) {
      return (error as EthersError).message!;
    }
    if (
      'data' in error &&
      typeof (error as EthersError).data === 'object' &&
      (error as EthersError).data &&
      typeof (error as EthersError).data!.message === 'string'
    ) {
      return (error as EthersError).data!.message!;
    }
  }
  return 'An unknown error occurred.';
}
