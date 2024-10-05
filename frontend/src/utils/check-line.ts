
/*
check if line is paralel to versor [1, 0, 0], [0, 1, 0], [0, 0, 1].
Use factor to determine how close to parallel the line has to be.
*/
export function checkLine(startPoint: [number, number, number], endPoint: [number, number, number], factor:number): boolean {
    const x = endPoint[0] - startPoint[0];
    const y = endPoint[1] - startPoint[1];
    const z = endPoint[2] - startPoint[2];
    const xAbs = Math.abs(x);
    const yAbs = Math.abs(y);
    const zAbs = Math.abs(z);
    if (xAbs > yAbs && xAbs > zAbs) {
        return xAbs / Math.sqrt(x * x + y * y + z * z) > factor;
    }
    if (yAbs > xAbs && yAbs > zAbs) {
        return yAbs / Math.sqrt(x * x + y * y + z * z) > factor;
    }
    return zAbs / Math.sqrt(x * x + y * y + z * z) > factor;

}
