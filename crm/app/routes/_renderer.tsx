import { jsxRenderer } from 'hono/jsx-renderer';
import { Link, Script } from 'honox/server';

import { Sidebar } from '$/components/Sidebar';

export default jsxRenderer(({ children }) => {
	return (
		<html lang="ja">
			<head>
				<meta charset="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<Link rel="icon" href="/favicon.ico" />
				<Link rel="stylesheet" href="/app/style.css" />
				<Link
					rel="stylesheet"
					href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:FILL@1"
				/>
				<Script src="/app/client.ts" async />
			</head>

			<body>
				<Sidebar />

				{children}
			</body>
		</html>
	);
});
