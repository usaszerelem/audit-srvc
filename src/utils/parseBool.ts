export default function parseBool(boolString: string): boolean {
    return /true/i.test(boolString);
}
