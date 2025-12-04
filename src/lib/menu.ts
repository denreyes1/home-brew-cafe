import { db } from "./firebase";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  setDoc,
  deleteDoc,
  type FirestoreError,
} from "firebase/firestore";

export type MenuCategory = "coffee" | "signature";

export type MenuItemDoc = {
  title: string;
  category: MenuCategory;
  options: string[];
  comingSoon?: boolean;
  isActive?: boolean;
  sortOrder?: number;
  description?: string;
  allowMilk?: boolean;
  allowSweetener?: boolean;
};

export type MenuItem = MenuItemDoc & {
  id: string;
};

export type NewMenuItemInput = Omit<MenuItemDoc, "sortOrder"> & {
  sortOrder?: number;
};

export type UpdateMenuItemInput = Partial<MenuItemDoc>;

export type MenuConfig = {
  sweeteners: string[];
  milks: string[];
  heroHighlightPrimaryId?: string | null;
  heroHighlightSecondaryId?: string | null;
  heroTitle?: string;
  heroBody?: string;
  menuTitle?: string;
  menuBody?: string;
};

const menuItemsCollection = collection(db, "menuItems");
const menuConfigDocRef = doc(db, "menuConfig", "default");

export function subscribeToMenuItems(
  onNext: (items: MenuItem[]) => void,
  onError?: (error: FirestoreError) => void,
) {
  const q = query(
    menuItemsCollection,
    // Single-field orderBy avoids requiring a composite Firestore index.
    // We group by category and title in the client.
    orderBy("sortOrder", "asc"),
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const items: MenuItem[] = snapshot.docs.map((snapshotDoc) => {
        const data = snapshotDoc.data() as MenuItemDoc;
        return {
          id: snapshotDoc.id,
          title: data.title,
          category: data.category,
          options: data.options ?? [],
          comingSoon: data.comingSoon ?? false,
          isActive: data.isActive ?? true,
          sortOrder: data.sortOrder ?? 0,
          description: data.description ?? "",
          allowMilk: data.allowMilk ?? true,
          allowSweetener: data.allowSweetener ?? true,
        };
      });

      onNext(items);
    },
    onError,
  );
}

export function subscribeToMenuConfig(
  onNext: (config: MenuConfig) => void,
  onError?: (error: FirestoreError) => void,
) {
  return onSnapshot(
    menuConfigDocRef,
    (snapshot) => {
      const data = snapshot.data() as Partial<MenuConfig> | undefined;
      const config: MenuConfig = {
        sweeteners: data?.sweeteners ?? [],
        milks: data?.milks ?? [],
        heroHighlightPrimaryId: data?.heroHighlightPrimaryId ?? null,
        heroHighlightSecondaryId: data?.heroHighlightSecondaryId ?? null,
        heroTitle: data?.heroTitle ?? "",
        heroBody: data?.heroBody ?? "",
        menuTitle: data?.menuTitle ?? "",
        menuBody: data?.menuBody ?? "",
      };

      onNext(config);
    },
    onError,
  );
}

export async function createMenuItem(input: NewMenuItemInput) {
  const payload: MenuItemDoc = {
    title: input.title,
    category: input.category,
    options: input.options ?? [],
    comingSoon: input.comingSoon ?? false,
    isActive: input.isActive ?? true,
    sortOrder: input.sortOrder ?? 0,
    description: input.description ?? "",
    allowMilk: input.allowMilk ?? true,
    allowSweetener: input.allowSweetener ?? true,
  };

  await addDoc(menuItemsCollection, payload);
}

export async function updateMenuItem(id: string, input: UpdateMenuItemInput) {
  const ref = doc(db, "menuItems", id);
  await updateDoc(ref, input);
}

export async function saveMenuConfig(config: MenuConfig) {
  await setDoc(menuConfigDocRef, config, { merge: true });
}

export async function deleteMenuItem(id: string) {
  const ref = doc(db, "menuItems", id);
  await deleteDoc(ref);
}

