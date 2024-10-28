export const natsWrapper = {
  client: {
    publich: (subject: string, data: string, callback: () => void) => {
      callback();
    },
  },
};
