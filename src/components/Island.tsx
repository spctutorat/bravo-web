import { stringify } from "querystring";
import React, { useEffect, useState } from "react";
import "./Island.scss";

function Island() {
	return (
		<main className="island">
			<h1>Identification</h1>
			<Form />
		</main>
	);
}

type FormState = {
	code?: string;
	username: string;
	password: string;
	name?: string;
	loading: boolean;
};

function Form() {
	const params = new URLSearchParams(window.location.search);
	const [state, setState] = useState<FormState>({
		username: params.get("username") || "",
		password: params.get("password") || "",
		code: params.get("code") || undefined,
		loading: true,
	});

	// Clean URL params
	window.history.replaceState(null, "", window.location.pathname);

	function handleChange(e: React.FormEvent<HTMLInputElement>) {
		const key = e.currentTarget.name as "username" | "password";
		const val = e.currentTarget.value;
		setState({
			...state,
			[key]: val,
		});
	}

	useEffect(() => {
		async function doStuff() {
			//TODO Get code if any
			if (state.code) {
				// Send code to backend to get info
				console.log(state.code);
			}
			setState({ ...state, loading: false });
		}
		doStuff();
	}, []);

	return (
		<form>
			{state.loading ? (
				<button className="login-discord" disabled>
					Chargement...
				</button>
			) : (
				<button
					className="login-discord"
					onClick={() =>
						window.open(
							"https://discord.com/api/oauth2/authorize?client_id=886700015072968734&redirect_uri=http%3A%2F%2Flocalhost%3A3000&response_type=code&scope=identify",
							"_self"
						)
					}
				>
					Se connecter avec Discord
				</button>
			)}
			<input
				className="form-control"
				id="username"
				name="username"
				type="text"
				value={state.username}
				onChange={handleChange}
				aria-label="Identifiant"
				placeholder="Identifiant EcoleDirecte"
			/>
			<input
				className="form-control"
				id="password"
				name="password"
				type="password"
				value={state.password}
				onChange={handleChange}
				aria-label="Mot de passe"
				placeholder="Mot de passe"
			/>
			<button type="submit">Vérifier</button>
		</form>
	);
}

export default Island;
