export type User = {
    id: number;
    username: string;
    createdAt: string;
};

export async function login(username: string, password: string): Promise<{ user: User }> {
    const res = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error || "Login failed");
    }

    return data;
}

export async function logout(): Promise<void> {
    const res = await fetch("http://localhost:3000/auth/logout", {
        method: "POST",
        credentials: "include",
    });

    if (!res.ok) {
        throw new Error("Logout failed");
    }
}

export async function getMe(): Promise<{ user: User | null }> {
    const res = await fetch("http://localhost:3000/auth/me", {
        credentials: "include",
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error || "Failed to fetch current user");
    }

    return data;
}

export async function register(username: string, password: string): Promise<{ user: User }> {
    const res = await fetch('http://localhost:3000/auth/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
    }

    return data;
}