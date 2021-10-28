import React, { useCallback, useEffect, useState } from 'react';
import './Island.scss';

function Island() {
	return (
		<main className="island">
			<h1>Identification</h1>
			<hr />
			<Form />
		</main>
	);
}

type FormState = {
	code?: string;
	token?: string;
	username: string;
	password: string;
	name?: string;
	discordLoading: boolean;
	loading: boolean;
};

function Form() {
	const params = new URLSearchParams(window.location.search);

	const [state, setState] = useState<FormState>({
		username: '',
		password: '',
		discordLoading: true,
		loading: false,
	});

	const paramsCode = params.get('code');
	if (paramsCode) localStorage.setItem('code', paramsCode);

	if (!state.code && localStorage.getItem('code'))
		setState({ ...state, code: localStorage.getItem('code') || undefined });

	// Clean URL params
	window.history.replaceState({}, document.title, '/');

	const clean = useCallback(() => {
		localStorage.clear();
		setState({
			...state,
			code: undefined,
			name: undefined,
			token: undefined,
		});
	}, [state]);

	function handleChange(e: React.FormEvent<HTMLInputElement>) {
		const key = e.currentTarget.name as 'username' | 'password';
		const val = e.currentTarget.value;
		setState({
			...state,
			[key]: val,
		});
	}

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		if (state.loading) return;
		setState({ ...state, loading: true });

		const { username, password, code, token } = state;
		const url = process.env.REACT_APP_API_BASE + '/login';
		const res = await fetch(url, {
			method: 'POST',
			body: JSON.stringify({ username, password, code, token }),
			headers: {
				'Content-Type': 'application/json',
			},
		});

		clean();

		setState({
			...state,
			name: undefined,
			code: undefined,
			token: undefined,
			loading: false,
		});

		if (res.status === 200) {
			alert(
				'Vous avez été identifié avec succès. Un message privé vous a été envoyé sur Discord.'
			);
		} else {
			alert('Erreur : ' + (await res.json()).message);
		}
	}

	useEffect(() => {
		async function doStuff() {
			// Get code if any
			if (state.code) {
				// Send code to backend to get info
				const url =
					process.env.REACT_APP_API_BASE + `/getUser?code=${state.code}`;
				const res = await fetch(url);
				if (res.status === 200) {
					const json = await res.json();
					const token = json.token.refresh_token;
					setState({ ...state, name: json.user.username, token: token });
					localStorage.setItem('name', json.user.username);
					localStorage.setItem('token', token);
					if (!json) clean();
				} else {
					clean();
				}
			}
			setState({ ...state, discordLoading: false });
		}
		doStuff();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	if (!state.code && !localStorage.getItem('code')) localStorage.clear();

	if (!state.name && localStorage.getItem('name'))
		setState({ ...state, name: localStorage.getItem('name') as string });

	if (!state.token && localStorage.getItem('token'))
		setState({ ...state, token: localStorage.getItem('token') as string });

	return (
		<form onSubmit={handleSubmit}>
			<h2>Compte Discord</h2>
			{state.discordLoading ? (
				<button className="login-discord" disabled>
					Chargement... ⌛
				</button>
			) : state.name ? (
				<button
					className="login-discord"
					onClick={() => {
						localStorage.clear();
						setState({ ...state, code: undefined, name: undefined });
					}}
				>
					Connecté en tant que {state.name} ✅
				</button>
			) : (
				<a
					className="login-discord"
					href={process.env.REACT_APP_DISCORD_AUTH_URL}
				>
					Se connecter avec Discord 🔗
				</a>
			)}
			<h2>Compte EcoleDirecte</h2>
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
			<button
				type="submit"
				disabled={!(state.code && state.username && state.password)}
			>
				Prouver l'identité
			</button>
		</form>
	);
}

export default Island;
