import { Plus } from "lucide-react";

const stories = [
  {
    id: 0,
    name: "Seu story",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    isOwn: true,
    hasNewStory: false,
  },
  {
    id: 1,
    name: "TechStore",
    avatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop",
    hasNewStory: true,
  },
  {
    id: 2,
    name: "ModaPlus",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    hasNewStory: true,
  },
  {
    id: 3,
    name: "AutoCar",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    hasNewStory: true,
  },
  {
    id: 4,
    name: "GameZone",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
    hasNewStory: false,
  },
  {
    id: 5,
    name: "FitLife",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    hasNewStory: true,
  },
  {
    id: 6,
    name: "BabyWorld",
    avatar: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&h=100&fit=crop",
    hasNewStory: false,
  },
];

const StoriesBar = () => {
  return (
    <div className="w-full overflow-x-auto scrollbar-hide py-4">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-4">
          {stories.map((story) => (
            <button
              key={story.id}
              className="flex flex-col items-center gap-1.5 min-w-fit group"
            >
              <div
                className={`relative flex h-16 w-16 items-center justify-center rounded-full p-0.5 transition-transform group-hover:scale-105 ${
                  story.hasNewStory
                    ? "bg-gradient-to-br from-primary to-accent"
                    : "bg-border"
                }`}
              >
                <div className="relative h-full w-full rounded-full bg-card p-0.5">
                  <img
                    src={story.avatar}
                    alt={story.name}
                    className="h-full w-full rounded-full object-cover"
                  />
                  {story.isOwn && (
                    <div className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-card">
                      <Plus className="h-3 w-3" />
                    </div>
                  )}
                </div>
              </div>
              <span className="text-xs font-medium text-muted-foreground max-w-[64px] truncate">
                {story.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StoriesBar;
