import React, { useState } from "react";
import ProfileHeader from "../components/profile/ProfileHeader.jsx";
import Tabs from "../components/profile/Tabs.jsx";
import FavoritesGrid from "../components/profile/FavoritesGrid.jsx";
import MyRecipesTable from "../components/profile/MyRecipesTable.jsx";

// Mock current user (could reuse users[0] from mock.js but keeping isolated)
const currentUser = {
  id: "u1",
  name: "An Nhiên",
  avatar:
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&w=128&q=60",
  bio: "Yêu món chay & cân bằng dưỡng chất.",
};

export default function Profile() {
  const [active, setActive] = useState("favorites");
  const [lastChange, setLastChange] = useState(null);

  const handleRemoveFavorite = () => {
    setLastChange(Date.now());
  };

  const handleRecipeUpdate = () => {
    setLastChange(Date.now());
  };

  return (
    <div className="space-y-10">
      <ProfileHeader
        user={currentUser}
        onEdit={() => alert("UI-only: chỉnh sửa")}
      />

      <div className="space-y-6">
        <Tabs active={active} onChange={setActive} />
        <div
          role="tabpanel"
          className="min-h-[200px]"
          aria-label={
            active === "favorites" ? "Danh sách yêu thích" : "Công thức của tôi"
          }
        >
          {active === "favorites" ? (
            <FavoritesGrid
              onRemove={handleRemoveFavorite}
              key={lastChange + "fav"}
            />
          ) : (
            <MyRecipesTable
              onUpdate={handleRecipeUpdate}
              key={lastChange + "my"}
            />
          )}
        </div>
      </div>
    </div>
  );
}
