
import {
  createContext,
  useContext,
  useReducer,
  useEffect,
} from "react";

const AuthContext = createContext();

const initialState = {
  isAuthenticated: false,
  currentUser: null,
};

function authReducer(state, action) {
  switch (action.type) {
    case "LOGIN":
      return {
        isAuthenticated: true,
        currentUser: action.payload,
      };

    case "LOGOUT":
      return initialState;

    default:
      return state;
  }
}

function initAuth() {
  try {
    const savedUser = localStorage.getItem("currentUser");

    if (savedUser) {
      return {
        isAuthenticated: true,
        currentUser: JSON.parse(savedUser),
      };
    }
  } catch {
    localStorage.removeItem("currentUser");
  }

  return initialState;
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(
    authReducer,
    initialState,
    initAuth
  );

  useEffect(() => {
    if (state.isAuthenticated && state.currentUser) {
      localStorage.setItem(
        "currentUser",
        JSON.stringify(state.currentUser)
      );
    } else {
      localStorage.removeItem("currentUser");
    }
  }, [state]);

  function login(user) {
    dispatch({ type: "LOGIN", payload: user });
  }

  function logout() {
    dispatch({ type: "LOGOUT" });
  }

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
