export function Sidebar() {
	return (
		<nav class="group fixed h-full w-16 bg-neutral-600 p-4 text-neutral-100 duration-200 hover:w-64 hover:rounded-r-xl">
			<ul class="flex flex-col gap-4 group-hover:items-start">
				<li>
					<a
						href="/"
						class="flex h-8 w-full items-center gap-4 font-medium duration-200 hover:opacity-40"
					>
						<span class="material-symbols-rounded text-[32px]!">home</span>

						<p class="invisible opacity-0 duration-200 group-hover:visible group-hover:opacity-100">
							Home
						</p>
					</a>
				</li>

				<li>
					<a
						href="/guest"
						class="flex h-8 w-full items-center gap-4 font-medium duration-200 hover:opacity-40"
					>
						<span class="material-symbols-rounded text-[32px]!">groups</span>

						<p class="invisible opacity-0 duration-200 group-hover:visible group-hover:opacity-100">
							Guest
						</p>
					</a>
				</li>
			</ul>

			<p class="invisible absolute bottom-4 justify-self-center text-nowrap opacity-0 duration-200 group-hover:visible group-hover:opacity-100">
				© {new Date(Date.now()).getFullYear} みるくれーる
			</p>
		</nav>
	);
}
