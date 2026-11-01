// import { Context } from 'hono';
// import { ContentfulStatusCode } from 'hono/utils/http-status';

// type HttpResponseBody = {
// 	success?: boolean;
// 	code?: string;
// 	data?: unknown;
// 	error?: unknown;
// };

// class HttpResponseBuilder {
// 	protected statusCode?: ContentfulStatusCode;
// 	protected body: HttpResponseBody = {};

// 	constructor(protected c: Context) {}

// 	public status(status: ContentfulStatusCode) {
// 		this.statusCode = status;

// 		return this;
// 	}

// 	public code(code: string) {
// 		this.body.code = code;

// 		return this;
// 	}
// }

// class HttpSuccessResponseBuilder extends HttpResponseBuilder {
// 	public data<T>(data: T) {
// 		this.body.success = true;
// 		this.body.data = data;

// 		return this.finish();
// 	}

// 	public finish() {
// 		return this.c.json({ success: true, ...this.body }, this.statusCode);
// 	}
// }

// class HttpErrorResponseBuilder extends HttpResponseBuilder {
// 	public error<T>(error: T) {
// 		this.body.success = false;
// 		this.body.error = error;

// 		return this.finish();
// 	}

// 	public finish() {
// 		return this.c.json({ success: false, ...this.body }, this.statusCode);
// 	}
// }

// export const HttpResponse = {
// 	ok: (c: Context) => new HttpSuccessResponseBuilder(c).status(200).code('OK'),
// 	created: (c: Context) => new HttpSuccessResponseBuilder(c).status(201).code('CREATED'),

// 	notFound: (c: Context) => new HttpErrorResponseBuilder(c).status(404).code('NOT_FOUND'),
// 	conflict: (c: Context) => new HttpErrorResponseBuilder(c).status(409).code('CONFLICT'),
// };
