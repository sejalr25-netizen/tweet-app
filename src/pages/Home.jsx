
import { useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";

// Replace YOUR_API_KEY with your CrudCrud API key.
const API_URL =
  "https://crudcrud.com/api/YOUR_API_KEY/tweets";

async function fetchTweets() {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Failed to fetch tweets");
  }

  return response.json();
}

async function postTweet(newTweet) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newTweet),
  });

  if (!response.ok) {
    throw new Error("Failed to post tweet");
  }

  return response.json();
}

async function updateTweetLikes(tweet) {
  const response = await fetch(`${API_URL}/${tweet._id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      text: tweet.text,
      author: tweet.author,
      likes: (tweet.likes || 0) + 1,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to like tweet");
  }

  return response;
}

export default function Home() {
  const [tweet, setTweet] = useState("");
  const queryClient = useQueryClient();
  const { currentUser } = useAuth();

  const {
    data: tweets = [],
    isPending,
    isError,
    error,
  } = useQuery({
    queryKey: ["tweets"],
    queryFn: fetchTweets,
  });

  const createTweet = useMutation({
    mutationFn: postTweet,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["tweets"],
      });
      setTweet("");
    },
  });

  const likeTweet = useMutation({
    mutationFn: updateTweetLikes,

    onMutate: async (tweetToLike) => {
      await queryClient.cancelQueries({
        queryKey: ["tweets"],
      });

      const previousTweets =
        queryClient.getQueryData(["tweets"]);

      queryClient.setQueryData(["tweets"], (oldTweets) =>
        oldTweets?.map((item) =>
          item._id === tweetToLike._id
            ? { ...item, likes: (item.likes || 0) + 1 }
            : item
        )
      );

      return { previousTweets };
    },

    onError: (_error, _tweet, context) => {
      if (context?.previousTweets !== undefined) {
        queryClient.setQueryData(
          ["tweets"],
          context.previousTweets
        );
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["tweets"],
      });
    },
  });

  function handleSubmit(e) {
    e.preventDefault();

    if (!tweet.trim()) return;

    createTweet.mutate({
      text: tweet.trim(),
      author: currentUser?.name || "Anonymous",
      likes: 0,
    });
  }

  return (
    <div className="home-page">
      <h1>Home Feed</h1>

      <form onSubmit={handleSubmit}>
        <textarea
          value={tweet}
          onChange={(e) => setTweet(e.target.value)}
          placeholder="What's happening?"
          rows={4}
        />

        <p>{tweet.length} characters</p>

        <button
          type="submit"
          disabled={!tweet.trim() || createTweet.isPending}
        >
          {createTweet.isPending ? "Posting..." : "Compose Tweet"}
        </button>

        {createTweet.isError && (
          <p role="alert">
            Could not post tweet. Please try again.
          </p>
        )}
      </form>

      <hr />

      <h2>Latest Tweets</h2>

      {isPending && <p>Loading tweets...</p>}

      {isError && (
        <p role="alert">Error: {error.message}</p>
      )}

      {!isPending && !isError && tweets.length === 0 && (
        <p>No tweets yet. Be the first to post!</p>
      )}

      {!isPending &&
        !isError &&
        tweets.map((item) => (
          <article key={item._id}>
            <p>{item.text}</p>
            <small>{item.author || "Anonymous"}</small>
            <p>❤️ {item.likes || 0} likes</p>

            <button
              onClick={() => likeTweet.mutate(item)}
              disabled={likeTweet.isPending}
            >
              ❤️ Like
            </button>
          </article>
        ))}
    </div>
  );
}
