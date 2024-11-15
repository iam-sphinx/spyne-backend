export const successResponse = (
  data: any = [],
  message: string = 'Request successful',
) => {
  return {
    status: 'success',
    data,
    message,
  };
};
