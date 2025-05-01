export const getUserIdFromToken = (request) => {

  const user_id = request.headers.get("x-user-id")

  const email = request.headers.get("Authorization")?.value;

  console.log(email)

  if (!user_id) {
    throw new Error('Unauthorized: No user id');
  }

  return {
    user_id
  };
};
