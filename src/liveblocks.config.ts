"use client";

import { createClient } from "@liveblocks/client";
import { createRoomContext, createLiveblocksContext } from "@liveblocks/react";

const client = createClient({
  authEndpoint: "/api/liveblocks-auth",
});

// Presence represents the properties that will exist on every User in the Room
// and that will-be shared with other Users in the Room.
type Presence = {
  cursor: { x: number; y: number } | null;
  // ...
};

// Storage represents the shared state that persists in the Room, even after
// all Users leave.
type Storage = {
  // ...
};

// UserMeta represents static information about each User that is maintained by
// your own IDP (e.g. Clerk).
type UserMeta = {
  id: string;
  info: {
    name: string;
    avatar: string;
    color: string;
  };
};

// RoomEvent represents custom events that can be sent between Users in a Room
type RoomEvent = {
  // ...
};

// ThreadMetadata represents custom metadata that can be added to threads
export type ThreadMetadata = {
  // ...
};

export const {
  suspense: {
    RoomProvider,
    useRoom,
    useMyPresence,
    useUpdateMyPresence,
    useSelf,
    useOthers,
    useOthersMapped,
    useOthersConnectionIds,
    useOther,
    useBroadcastEvent,
    useEventListener,
    useErrorListener,
    useStorage,
    useHistory,
    useUndo,
    useRedo,
    useCanUndo,
    useCanRedo,
    useMutation,
    useStatus,
    useLostConnectionListener,
    useThreads,
    useUser,
    useCreateThread,
    useEditThreadMetadata,
    useCreateComment,
    useEditComment,
    useDeleteComment,
    useAddReaction,
    useRemoveReaction,
  },
} = createRoomContext<Presence, Storage, UserMeta, RoomEvent, ThreadMetadata>(client);

export const {
  suspense: {
    LiveblocksProvider,
  },
} = createLiveblocksContext<UserMeta, ThreadMetadata>(client);
