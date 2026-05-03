type LoadState<T> =
    | {status: "idle"}
    | {status: "loading"}
    | {status: "error", message: string}
    | {status: "ready", data: T}


function assertNever(x: never): never
{
    throw new Error(`Unhandled case: ${JSON.stringify(x)}'`);
}

function describe<T>(s: LoadState<T>): string
{
    switch (s.status) {
        case "idle":
            return "idle";
        case "loading":
            return "loading";
        case "error":
            return s.message;
        case "ready":
            return JSON.stringify(s.data);
        default:
            assertNever(s);
    }
}

const s : LoadState<string> = {status: "idle"};

console.log(describe(s));