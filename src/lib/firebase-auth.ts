"use client";

import { getAuth, type Auth } from "firebase/auth";
import { firebaseApp } from "./firebase";

export const firebaseAuth: Auth = getAuth(firebaseApp);
