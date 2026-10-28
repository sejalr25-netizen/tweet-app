
import { useParams } from "react-router-dom";

export default function Profile() {
  const { userId } = useParams();

  return (
    <section>
      <h1>User Profile</h1>
      <p>User ID: {userId}</p>
    </section>
  );
}
