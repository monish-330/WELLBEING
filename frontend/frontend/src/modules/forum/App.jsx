import { useState } from "react";
import Header from "./components/Header";
import Tabs from "./components/Tabs";
import PostForm from "./components/PostForm";
import PostList from "./components/PostList";
import BottomNav from "./components/BottomNav";
import "./App.css";

export default function ForumApp() {
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = () => setRefreshKey((k) => k + 1);

  return (
    <div className="forum-app">
      <Header />
      <Tabs />
      <div className="forum-content">
        <PostForm onPostSubmit={refresh} />
        <PostList key={refreshKey} />
      </div>
      <BottomNav />
    </div>
  );
}
