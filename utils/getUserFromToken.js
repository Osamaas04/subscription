import { decode } from "jsonwebtoken";

export function getUserFromToken(request) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Authorization header missing or malformed");
  }

  const token = authHeader.split(" ")[1]; 

  const decoded = decode(token);

  return {
    id: decoded.uid,      
    email: decoded.email, 
  };
}
