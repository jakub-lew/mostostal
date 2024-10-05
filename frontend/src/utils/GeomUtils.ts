
//see https://pl.wikipedia.org/wiki/Elementarne_macierze_transformacji

/**
 * MatrixUtils is a class with static functions.<BR>
 * General assumptions: The functions do not modify original objects.
 * They are restricted to work with vectors and matrices of dimension 3 unless there is a suffix "4" at the end of the function (for 4-dimensional vectors and matrices).
 * <BR><BR>
 * For more information about direct cosine matrices and rotation matrices investigate sites:
 * https://en.wikipedia.org/wiki/Rotation_matrix,
 * https://www.vectornav.com/resources/inertial-navigation-primer/math-fundamentals/math-attitudetran,
 * https://en.wikiversity.org/wiki/PlanetPhysics/Direction_Cosine_Matrix
 * <BR><BR>
 * More information about transform matrices: https://pl.wikipedia.org/wiki/Elementarne_macierze_transformacji
 */
import * as MATHJS from 'mathjs';

export class MatrixUtils {
  static zeroVector(): Coords {
    return [0, 0, 0];
  }
  static zeroVector4(): Coords4 {
    return [0, 0, 0, 0];
  }
  static zeroMatrix(): Matrix {
    return new Array(3).fill(0).map(() => new Array(3).fill(0)) as Matrix;
  }
  static zeroMatrix4(): Matrix4 {
    return new Array(4).fill(0).map(() => new Array(4).fill(0)) as Matrix4;
  }
  static identityMatrix3(): Matrix {
    return [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ];
  }
  static identityMatrix4(): Matrix4 {
    return [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1, 0],
      [0, 0, 0, 1],
    ];
  }
  static reverse(vectorA: Coords): Coords {
    const dim = vectorA.length;
    const result = this.zeroVector();
    for (let i = 0; i < dim; i++) result[i] = -vectorA[i];
    return result;
  }
  static add(vectorA: Coords, vectorB: Coords): Coords {
    const dim = vectorA.length;
    const result = this.zeroVector();
    for (let i = 0; i < dim; i++) result[i] = vectorA[i] + vectorB[i];
    return result;
  }
  /**
   * @returns vectorA - vectorB
   */
  static sub(vectorA: Coords, vectorB: Coords): Coords {
    const dim = vectorA.length;
    const result = this.zeroVector();
    for (let i = 0; i < dim; i++) result[i] = vectorA[i] - vectorB[i];
    return result;
  }
  static reverseM(matrix3x3: Matrix): Matrix {
    const dim = matrix3x3.length;
    const result = this.zeroMatrix();
    for (let i = 0; i < dim; i++) for (let j = 0; j < dim; j++) result[i][j] = -matrix3x3[i][j];
    return result;
  }
  static addM(matrixA3x3: Matrix, matrixB3x3: Matrix): Matrix {
    const dim = matrixA3x3.length;
    const result = this.zeroMatrix();
    for (let i = 0; i < dim; i++)
      for (let j = 0; j < dim; j++) result[i][j] = matrixA3x3[i][j] + matrixB3x3[i][j];
    return result;
  }
  /**
   * @returns matrixA3x3 - matrixB3x3
   */
  static subM(matrixA3x3: Matrix, matrixB3x3: Matrix): Matrix {
    const result = this.zeroMatrix();
    const dim = matrixA3x3.length;
    for (let i = 0; i < dim; i++)
      for (let j = 0; j < dim; j++) result[i][j] = matrixA3x3[i][j] - matrixB3x3[i][j];
    return result;
  }
  static multiply(matrix3x3: Matrix, vector3: Coords): Coords {
    const dim = vector3.length;
    const result = this.zeroVector();
    for (let k = 0; k < dim; k++)
      for (let i = 0; i < dim; i++) result[k] += matrix3x3[k][i] * vector3[i];
    return result;
  }
  static multiply4(matrix4x4: Matrix4, vector4: Coords4): Coords4 {
    const dim = matrix4x4.length;
    const result = this.zeroVector4();
    for (let k = 0; k < dim; k++)
      for (let i = 0; i < dim; i++) result[k] += matrix4x4[k][i] * vector4[i];
    return result;
  }
  static multiplyM(matrixA3x3: Matrix, matrixB3x3: Matrix): Matrix {
    const dim = matrixA3x3.length;
    const result = this.zeroMatrix();
    for (let i = 0; i < dim; i++) {
      for (let j = 0; j < dim; j++) {
        let sum = 0.0;
        for (let k = 0; k < dim; k++) {
          sum += matrixA3x3[i][k] * matrixB3x3[k][j];
        }
        result[i][j] = sum;
      }
    }
    return result;
  }
  static multiplyM4(matrixA4x4: Matrix4, matrixB4x4: Matrix4): Matrix4 {
    const dim = matrixA4x4.length;
    const result = this.zeroMatrix4();
    for (let i = 0; i < dim; i++) {
      for (let j = 0; j < dim; j++) {
        let sum = 0.0;
        for (let k = 0; k < dim; k++) {
          sum += matrixA4x4[i][k] * matrixB4x4[k][j];
        }
        result[i][j] = sum;
      }
    }
    return result;
  }
  static scalarProduct(vector1: Coords, vector2: Coords): number {
    return vector1[0] * vector2[0] + vector1[1] * vector2[1] + vector1[2] * vector2[2];
  }
  static crossProduct(vector1: Coords, vector2: Coords): Coords {
    return [
      vector1[1] * vector2[2] - vector1[2] * vector2[1],
      vector1[2] * vector2[0] - vector1[0] * vector2[2],
      vector1[0] * vector2[1] - vector1[1] * vector2[0],
    ];
  }
  static lengthOf(vector: Coords): number {
    return Math.sqrt(this.scalarProduct(vector, vector));
  }
  static distance(pt1: Coords, pt2: Coords): number {
    return MatrixUtils.lengthOf(MatrixUtils.sub(pt1, pt2));
  }
  static getCloserToTarget(pts: [Coords, Coords], target: Coords) {
    return MatrixUtils.distance(pts[0], target) < MatrixUtils.distance(pts[1], target)
      ? pts[0]
      : pts[1];
  }
  static getFurtherToTarget(pts: [Coords, Coords], target: Coords) {
    return MatrixUtils.distance(pts[0], target) > MatrixUtils.distance(pts[1], target)
      ? pts[0]
      : pts[1];
  }
  static multiplyBy(vector: Coords, factor: number): Coords {
    const dim = vector.length;
    const ret: Coords = [...vector];
    for (let i = 0; i < dim; i++) {
      ret[i] = vector[i] * factor;
    }
    return ret;
  }
  static normalize(vector: Coords): Coords {
    const len = this.lengthOf(vector);
    if (0 == len) return [0, 0, 0];
    else {
      return this.multiplyBy(vector, 1 / len);
    }
  }
  static getProjection(vector: Coords, axis: Coords) {
    const normalizedAxis = MatrixUtils.normalize(axis);
    return MatrixUtils.scalarProduct(vector, normalizedAxis);
  }

  /**
   * @returns angle [-PI,PI] between two vectors (from @param vec1 to @param vec2)
   * where the positive angle is in the direction of @param rotationAxis (acc. to right-hand rule)
   */
  static angleBtwVectors(vec1: Coords, vec2: Coords, rotationAxis: Coords) {
    if (MatrixUtils.lengthOf(vec1) == 0 || MatrixUtils.lengthOf(vec2) == 0) {
      throw new Error('None of vector can have 0 length.');
    }
    const rotationAxisNormalized = MatrixUtils.normalize(rotationAxis);
    const firstAxis = MatrixUtils.normalize(vec1);
    const secondAxis = MatrixUtils.crossProduct(rotationAxisNormalized, firstAxis);
    const firstCoord = MatrixUtils.getProjection(vec2, firstAxis);
    const secondCoord = MatrixUtils.getProjection(vec2, secondAxis);
    return Math.atan2(secondCoord, firstCoord);
  }
  /**
   * @returns an exemplary perpendicular vector to the vector provided as the argument; the returned vector is normalized
   */
  static getAnyPerpendicularVector(vector: Coords): Coords {
    const xGlobalAxis: Coords = [1, 0, 0];
    const yGlobalAxis: Coords = [0, 1, 0];
    const [xCrossProduct, yCrossProduct] = [
      MatrixUtils.crossProduct(xGlobalAxis, vector),
      MatrixUtils.crossProduct(yGlobalAxis, vector),
    ];
    const perpendicularVector = MatrixUtils.normalize(
      MatrixUtils.lengthOf(xCrossProduct) > MatrixUtils.lengthOf(yCrossProduct)
        ? MatrixUtils.crossProduct(vector, xCrossProduct)
        : MatrixUtils.crossProduct(vector, yCrossProduct)
    );
    return perpendicularVector;
  }
  /**
   * TODO not tested (but unused -> tests should be added before any usage)
   */
  static directionCosine(vector1: Coords, vector2: Coords): number {
    const div = this.lengthOf(vector1) * this.lengthOf(vector2);
    if (0 == div) {
      throw new Error(`direction cosine doesn't exist for 0 vector`);
    } else {
      return this.scalarProduct(vector1, vector2) / div;
    }
  }
  /**
   * TODO not tested (but unused -> tests should be added before any usage)<BR>
   * other name is rotation matrix
   */
  static directionCosineMatrix(
    sourceCoordinateSystem: Matrix,
    targetCoordinateSystem: Matrix
  ): Matrix {
    const dcm = this.zeroMatrix();
    const length = 3;
    for (let k = 0; k < length; k++)
      for (let i = 0; i < length; i++) {
        const srcVec = sourceCoordinateSystem[i];
        const trgVec = targetCoordinateSystem[k];
        dcm[k][i] = MatrixUtils.directionCosine(trgVec, srcVec);
      }
    return dcm;
  }
  /**
   * TODO not tested (but unused -> tests should be added before any usage)<BR>
   * Recalculates coordinates of point/vector for another coordinate system.
   * This function implementation may be easily substituted with operations on transform matrices (implemented in this class, as well)
   */
  static transformToNewCS(
    vector: Coords,
    sourceCoordinateSystem: Matrix,
    targetCoordinateSystem: Matrix
  ): Coords {
    const dcm = MatrixUtils.directionCosineMatrix(sourceCoordinateSystem, targetCoordinateSystem);
    return MatrixUtils.multiply(dcm, vector);
  }

  /**
      Cuts the last row and the last column of the input 4x4 matrix
   */
  static extract3x3Matrix(matrix4x4: Matrix4): Matrix {
    const result = this.zeroMatrix();
    const dim = result.length;
    for (let i = 0; i < dim; i++) for (let j = 0; j < dim; j++) result[i][j] = matrix4x4[i][j];
    return result;
  }
  static createTransformMatrix(rotationMatrix: Matrix, translation: Coords): Matrix4 {
    const dim = rotationMatrix.length;
    const result = this.zeroMatrix4();
    for (let i = 0; i < dim; i++) for (let j = 0; j < dim; j++) result[i][j] = rotationMatrix[i][j];
    for (let i = 0; i < dim; i++) result[i][3] = translation[i];
    result[3][3] = 1;
    return result;
  }
  static extractTranslation(transformMatrix: Matrix4): Coords {
    const result = this.zeroVector();
    const dim = 3;
    for (let i = 0; i < dim; i++) result[i] = transformMatrix[i][3];
    return result;
  }
  static transposedMatrix(matrix3x3: Matrix): Matrix {
    const dim = matrix3x3.length;
    const result = this.zeroMatrix();
    for (let i = 0; i < dim; i++) for (let j = 0; j < dim; j++) result[i][j] = matrix3x3[j][i];
    return result;
  }
  static transposedMatrix4(matrix4x4: Matrix4): Matrix4 {
    const dim = matrix4x4.length;
    const result = this.zeroMatrix4();
    for (let i = 0; i < dim; i++) for (let j = 0; j < dim; j++) result[i][j] = matrix4x4[j][i];
    return result;
  }
  /**
   * @returns inversed transformMatrix. Transform matrices are special and its inversion may be done in a particular way, as may be seen in the code.
   * See more at: https://pl.wikipedia.org/wiki/Elementarne_macierze_transformacji.
   */
  static inversedTransformMatrix(transformMatrix: Matrix4): Matrix4 {
    const rotation = this.extract3x3Matrix(transformMatrix);
    const translation = this.extractTranslation(transformMatrix);
    const rotationTransposed = this.transposedMatrix(rotation);
    const newTranslation = this.multiply(this.reverseM(rotationTransposed), translation);
    const ret = this.createTransformMatrix(rotationTransposed, newTranslation);
    return ret;
  }

  static convertToIndexedVector(vector: XYZt): Coords {
    return [vector.x, vector.y, vector.z];
  }
  static convertToXYZ(vector: Coords): XYZt {
    return {
      x: vector[0],
      y: vector[1],
      z: vector[2],
    };
  }

  static areMatricesTheSame(matrixA3x3: Matrix, matrixB3x3: Matrix, tolerance: number): boolean {
    const dim = matrixA3x3.length;
    for (let i = 0; i < dim; i++) {
      for (let j = 0; j < dim; j++) {
        if (Math.abs(matrixA3x3[i][j] - matrixB3x3[i][j]) > tolerance) {
          return false;
        }
      }
    }
    return true;
  }

  static areMatricesTheSame4(matrixA4x4: Matrix4, matrixB4x4: Matrix4, tolerance: number): boolean {
    const dim = matrixA4x4.length;
    for (let i = 0; i < dim; i++) {
      for (let j = 0; j < dim; j++) {
        if (Math.abs(matrixA4x4[i][j] - matrixB4x4[i][j]) > tolerance) {
          return false;
        }
      }
    }
    return true;
  }
}

/**
 * This class provides Coordinate System which is stored by origin(position) and  X & Y axes. Z axis is calculated automatically.<BR>
 * Coordinate System  may be also converted from/to a corresponding transform matrix. For more information see: https://pl.wikipedia.org/wiki/Elementarne_macierze_transformacji.
 */
export class CoordinateSystem {
  xAxis: Coords = [1, 0, 0];
  yAxis: Coords = [0, 1, 0];
  position: Coords = [0, 0, 0];
  constructor(position: Coords, xAxis: Coords, yAxis: Coords) {
    this.position = position;
    this.xAxis = MatrixUtils.normalize(xAxis);
    this.yAxis = MatrixUtils.normalize(yAxis);
  }
  static defaultCS(): CoordinateSystem {
    return new CoordinateSystem([0, 0, 0], [1, 0, 0], [0, 1, 0]);
  }
  /**
   * @returns z axis coordinates which is a cross product xAxis x yAxis
   */
  calculateZAxis(): Coords {
    const crossProduct = MatrixUtils.crossProduct(this.xAxis, this.yAxis);
    const zAxis = MatrixUtils.normalize(crossProduct);
    if (MatrixUtils.scalarProduct(zAxis, zAxis) == 0)
      throw new Error('Axes of the CS are colinear');
    //maybe it should be also checked if x and y are perpendicular
    return zAxis;
  }
  clone(): CoordinateSystem {
    return new CoordinateSystem([...this.position], [...this.xAxis], [...this.yAxis]);
  }
  toTransformMatrix(): Matrix4 {
    const zAxis = this.calculateZAxis();
    /*
    Below, the inversed rotation matrix is taken (which, in case of rotation matrix, equals transposed).
    This is because we can regard X,Y,Z as the axes (=vectors) of the target Coordinate System which we get AFTER transformation.
    */
    const rotationMatrix = MatrixUtils.transposedMatrix([this.xAxis, this.yAxis, zAxis]);
    const translation = this.position;
    return MatrixUtils.createTransformMatrix(rotationMatrix, translation);
  }
  static fromTransformMatrix(transformMatrix4x4: Matrix4): CoordinateSystem {
    //for the below calculations see the comment in toTransformMatrix()
    const rotationMatrix = MatrixUtils.extract3x3Matrix(transformMatrix4x4);
    const xVector = MatrixUtils.multiply(rotationMatrix, [1, 0, 0]);
    const yVector = MatrixUtils.multiply(rotationMatrix, [0, 1, 0]);
    const location = MatrixUtils.extractTranslation(transformMatrix4x4);
    return new CoordinateSystem(location, xVector, yVector);
  }
  isEqualTo(other: CoordinateSystem, tolerance: number): boolean {
    return MatrixUtils.areMatricesTheSame4(
      this.toTransformMatrix(),
      other.toTransformMatrix(),
      tolerance
    );
  }
}

export type Coords = [number, number, number];
export type Coords4 = [number, number, number, number];
export type Matrix = [[number, number, number], [number, number, number], [number, number, number]];
export type Matrix4 = [
  [number, number, number, number],
  [number, number, number, number],
  [number, number, number, number],
  [number, number, number, number]
];

export type XYZt = {
  x: number;
  y: number;
  z: number;
};

export type Line3dt = {
  firstPt: Coords;
  secondPt: Coords;
};

export type PairOfLines = {
  firstLine: Line3dt;
  secondLine: Line3dt;
};
export class Utils3D {
  static ConvertLineToArray(line: Line3dt): [Coords, Coords] {
    return [line.firstPt, line.secondPt];
  }

  static ConvertLineToLine3dt(pts: [Coords, Coords]): Line3dt {
    return { firstPt: pts[0], secondPt: pts[1] };
  }

  static isOrientationTheSame(
    coordSystems: [CoordinateSystem, CoordinateSystem],
    tolerance: number
  ) {
    const orientation1 = MatrixUtils.extract3x3Matrix(coordSystems[0].toTransformMatrix());
    const orientation2 = MatrixUtils.extract3x3Matrix(coordSystems[1].toTransformMatrix());
    const isOrientationTheSame = MatrixUtils.areMatricesTheSame(
      orientation1,
      orientation2,
      tolerance
    );
    return isOrientationTheSame;
  }

  // Get closest point on lines
  static getPointsWithMinimalDistanceBetweenLines(
    pairOfLines: [Line3dt, Line3dt]
  ): [Coords, Coords] {
    const point1OnLine1 = pairOfLines[0].firstPt;
    const point2OnLine1 = pairOfLines[0].secondPt;
    const point1OnLine2 = pairOfLines[1].firstPt;
    const point2OnLine2 = pairOfLines[1].secondPt;

    const line1Vector = MatrixUtils.sub(point2OnLine1, point1OnLine1);
    const line2Vector = MatrixUtils.sub(point2OnLine2, point1OnLine2);
    const line12Vector = MatrixUtils.sub(point1OnLine2, point1OnLine1);

    const line1VectorScalarProduct = MatrixUtils.scalarProduct(line1Vector, line1Vector);
    const line2VectorScalarProduct = MatrixUtils.scalarProduct(line2Vector, line2Vector);
    const line1VectorLine2VectorScalarProduct = MatrixUtils.scalarProduct(line1Vector, line2Vector);
    const line1VectorLine12VectorScalarProduct = MatrixUtils.scalarProduct(
      line1Vector,
      line12Vector
    );
    const line2VectorLine12VectorScalarProduct = MatrixUtils.scalarProduct(
      line2Vector,
      line12Vector
    );

    //
    // line1VectorScalarProduct * s - line1VectorLine2VectorScalarProduct * t = line1VectorLine12VectorScalarProduct
    // line1VectorLine2VectorScalarProduct * s - line2VectorScalarProduct * t = line2VectorLine12VectorScalarProduct
    // 1 * x = 1

    const [s, t] = MATHJS.multiply(
      MATHJS.inv([
        [line1VectorScalarProduct, -line1VectorLine2VectorScalarProduct],
        [line1VectorLine2VectorScalarProduct, -line2VectorScalarProduct],
      ]),
      [line1VectorLine12VectorScalarProduct, line2VectorLine12VectorScalarProduct]
    );
    const pointOnLine1 = MatrixUtils.add(point1OnLine1, MatrixUtils.multiplyBy(line1Vector, s));
    const pointOnLine2 = MatrixUtils.add(point1OnLine2, MatrixUtils.multiplyBy(line2Vector, t));
    // console.log({
    //   point1OnLine1: point1OnLine1,
    //   movement: MatrixUtils.multiplyBy(line1Vector, s),
    //   pointOnLine1: pointOnLine1,
    // });
    // console.log({
    //   point1OnLine2: point1OnLine2,
    //   movement: MatrixUtils.multiplyBy(line2Vector, t),
    //   pointOnLine2: pointOnLine2,
    // });
    return [pointOnLine1, pointOnLine2];
  }

  // Get closest point on line to point
  static getClosestPointOnLineToPoint(line: Line3dt, point: Coords): Coords {
    const lineVector = MatrixUtils.sub(line.secondPt, line.firstPt);
    const pointVector = MatrixUtils.sub(point, line.firstPt);
    const lineVectorNormalized = MatrixUtils.normalize(lineVector);
    const scalarProduct = MatrixUtils.scalarProduct(lineVectorNormalized, pointVector);
    const closestPointOnLineToPoint = MatrixUtils.add(
      line.firstPt,
      MatrixUtils.multiplyBy(lineVectorNormalized, scalarProduct)
    );
    return closestPointOnLineToPoint;
  }

  // Find distance between two lines in 3D
  static getDistanceBetweenLines(pairOfLines: [Line3dt, Line3dt]): number | undefined {
    const [x1, x2] = [pairOfLines[0].firstPt, pairOfLines[0].secondPt];
    const [x3, x4] = [pairOfLines[1].firstPt, pairOfLines[1].secondPt];
    const a = MatrixUtils.sub(x2, x1);
    const b = MatrixUtils.sub(x4, x3);
    const c = MatrixUtils.sub(x3, x1);
    const abCrossProduct = MatrixUtils.crossProduct(a, b);
    const abCrossProductSquared = MatrixUtils.scalarProduct(abCrossProduct, abCrossProduct);
    if (abCrossProductSquared == 0)
      // shouldn't happen if lines are coplanar but you never know when you get 0 in computational geometry :)
      return undefined;
    const cbCrossProduct = MatrixUtils.crossProduct(c, b);
    const distance = MatrixUtils.lengthOf(cbCrossProduct) / Math.sqrt(abCrossProductSquared);
    return distance;
  }

  // check if point is on the segment of the line
  static isPointOnLineSegment(pt: Coords, line: Line3dt): boolean {
    const [x1, x2] = [line.firstPt, line.secondPt];
    const a = MatrixUtils.sub(x2, x1);
    const b = MatrixUtils.sub(pt, x1);
    const scalarProduct = MatrixUtils.scalarProduct(a, b);
    const lengthOfA = MatrixUtils.lengthOf(a);
    const lengthOfB = MatrixUtils.lengthOf(b);
    const isPointOnLineSegment =
      scalarProduct >= 0 && scalarProduct <= lengthOfA * lengthOfA && lengthOfB <= lengthOfA;
    return isPointOnLineSegment;
  }

  // check if point are the same
  static isTheSamePoint(pt1: Coords, pt2: Coords, tolerance: number): boolean {
    const distance = MatrixUtils.distance(pt1, pt2);
    return distance <= tolerance;
  }

  static getCoordsInDifferentCS(
    coords: Coords,
    srcCoordSys: CoordinateSystem,
    trgCoordSys: CoordinateSystem = CoordinateSystem.defaultCS()
  ): Coords {
    const srcTransformMatrix = srcCoordSys.toTransformMatrix();
    const trgTransformMatrix = trgCoordSys.toTransformMatrix();
    const coordsToTransform = [...coords, 1] as Coords4;
    const inversedTrgMatrix = MatrixUtils.inversedTransformMatrix(trgTransformMatrix);
    const transformationMatrix = MatrixUtils.multiplyM4(inversedTrgMatrix, srcTransformMatrix);
    const resultOfTransform = MatrixUtils.multiply4(transformationMatrix, coordsToTransform);
    return [resultOfTransform[0], resultOfTransform[1], resultOfTransform[2]];
  }

  static getLineInDifferentCS(
    line: [Coords, Coords],
    srcCoordSys: CoordinateSystem,
    trgCoordSys: CoordinateSystem = CoordinateSystem.defaultCS()
  ): [Coords, Coords] {
    return [
      this.getCoordsInDifferentCS(line[0], srcCoordSys, trgCoordSys),
      this.getCoordsInDifferentCS(line[1], srcCoordSys, trgCoordSys),
    ];
  }

  static getCSinDifferentCS(
    coordSystem: CoordinateSystem,
    srcCoordSystem: CoordinateSystem,
    trgCoordSystem: CoordinateSystem = CoordinateSystem.defaultCS()
  ): CoordinateSystem {
    const srcTransformMatrix = srcCoordSystem.toTransformMatrix();
    const trgTransformMatrix = trgCoordSystem.toTransformMatrix();
    const inversedTrgMatrix = MatrixUtils.inversedTransformMatrix(trgTransformMatrix);
    const transformationMatrix = MatrixUtils.multiplyM4(inversedTrgMatrix, srcTransformMatrix);
    const resultingCoordSystemAsTransforMatrix = MatrixUtils.multiplyM4(
      transformationMatrix,
      coordSystem.toTransformMatrix()
    );
    return CoordinateSystem.fromTransformMatrix(resultingCoordSystemAsTransforMatrix);
  }

  /**
   * The fuction checks colinearity of 2 lines with a given tolerance
   * @param lines list of 2 lines (order does not matter)
   * @param tolerance tolerance
   * @returns true fi colinear, false if not
   */
  static areColinear(lines: [Line3dt, Line3dt], tolerance: number): boolean {
    const line2vec = MatrixUtils.sub(lines[1].secondPt, lines[1].firstPt);
    const line2startToLine1Start = MatrixUtils.sub(lines[0].firstPt, lines[1].firstPt);
    const line2startToLine1End = MatrixUtils.sub(lines[0].secondPt, lines[1].firstPt);
    return (
      MatrixUtils.lengthOf(MatrixUtils.crossProduct(line2vec, line2startToLine1Start)) <=
        tolerance &&
      MatrixUtils.lengthOf(MatrixUtils.crossProduct(line2vec, line2startToLine1End)) <= tolerance
    );
  }

  /**
   * check if the first line is part of the second line with provided tolerance
   * @param pairOfLines the order of the lines matters - it is checked whether the first line is included in the second one
   * @param tolerance tolerance
   * @returns true if yes, false if not
   */
  static isFstLinePartOfSndLine(pairOfLines: [Line3dt, Line3dt], tolerance: number) {
    if (!this.areColinear(pairOfLines, tolerance)) return false;
    const isValueBetween = (minLimit: number, value: number, maxLimit: number) => {
      return value >= minLimit - tolerance && value <= maxLimit + tolerance;
    };

    const line2vec = MatrixUtils.sub(pairOfLines[1].secondPt, pairOfLines[1].firstPt);
    const line2Length = MatrixUtils.lengthOf(line2vec);
    const line2normalized = MatrixUtils.normalize(line2vec);
    const line2startToLine1Start = MatrixUtils.sub(pairOfLines[0].firstPt, pairOfLines[1].firstPt);
    const line2startToLine1End = MatrixUtils.sub(pairOfLines[0].secondPt, pairOfLines[1].firstPt);

    if (
      !isValueBetween(
        0,
        MatrixUtils.scalarProduct(line2normalized, line2startToLine1Start),
        line2Length
      ) ||
      !isValueBetween(
        0,
        MatrixUtils.scalarProduct(line2normalized, line2startToLine1End),
        line2Length
      )
    )
      return false;
    return true;
  }

  /**
   * The function checks if lines are coplanar with a provided tolerance
   * @param pairOfLines 2 lines for which coplanarity test is done (solution from https://mathworld.wolfram.com/Line-LineIntersection.html)
   * @param tolerance tolerance of the test
   * @returns true if line a re coplanar, false if not
   */
  static areLinesCoplanar(pairOfLines: [Line3dt, Line3dt], tolerance: number): boolean {
    const [x1, x2] = [pairOfLines[0].firstPt, pairOfLines[0].secondPt];
    const [x3, x4] = [pairOfLines[1].firstPt, pairOfLines[1].secondPt];
    const a = MatrixUtils.sub(x2, x1);
    const b = MatrixUtils.sub(x4, x3);
    const c = MatrixUtils.sub(x3, x1);
    const determinant = MatrixUtils.scalarProduct(c, MatrixUtils.crossProduct(a, b));
    return Math.abs(determinant) <= tolerance;
  }

  /**
   * Intersection of the lines, or of their extensions, is calculated (solution from https://mathworld.wolfram.com/Line-LineIntersection.html)
   * @param pairOfLines 2 lines whose intersection will be calculated
   * @param toleranceForCoplanarityCheck tolerance with which coplanarity is calculated (see areLinesCoplanar function)
   * @returns point (Coords) of intersection or undefined if intersection of lines (or of their extension) doesn't exist
   **/
  static getIntersection(
    pairOfLines: [Line3dt, Line3dt],
    toleranceForCoplanarityCheck: number
  ): Coords | undefined {
    if (!this.areLinesCoplanar(pairOfLines, toleranceForCoplanarityCheck)) return undefined;
    const [x1, x2] = [pairOfLines[0].firstPt, pairOfLines[0].secondPt];
    const [x3, x4] = [pairOfLines[1].firstPt, pairOfLines[1].secondPt];
    const a = MatrixUtils.sub(x2, x1);
    const b = MatrixUtils.sub(x4, x3);
    const c = MatrixUtils.sub(x3, x1);
    const abCrossProduct = MatrixUtils.crossProduct(a, b);
    const abCrossProductSquared = MatrixUtils.scalarProduct(abCrossProduct, abCrossProduct);
    if (abCrossProductSquared == 0)
      // shouldn't happen if lines are coplanar but you never know when you get 0 in computational geometry :)
      return undefined;
    const cbCrossProduct = MatrixUtils.crossProduct(c, b);
    return MatrixUtils.add(
      x1,
      MatrixUtils.multiplyBy(
        a,
        MatrixUtils.scalarProduct(cbCrossProduct, abCrossProduct) / abCrossProductSquared
      )
    );
  }

  /**
   * Transforms location to another relative location
   * @param location original location
   * @param differentLocation another location provided relatively - in coordinate system of the original location
   * @returns coordinate system which results from the transformation
   * @note transformation of 1. CS to 2. CS which is relatively defined equals different scenario: pasting of 2. CS. into 1. CS
   */
  public static getLocationTransformedToDifferentLocation(
    location: CoordinateSystem,
    differentLocation: CoordinateSystem
  ): CoordinateSystem {
    return this.getCoordSystemAfterInsertionIntoAnotherOne(differentLocation, location);
  }

  /**
   * Inserts a CS into another one
   * @param coordSystemToInsert CS to be inserted
   * @param destinationCoordSystem CS where the first one will be inserted
   * @returns CS after insertion
   * See {@link Utils3D.getLocationTransformedToDifferentLocation}
   */
  public static getCoordSystemAfterInsertionIntoAnotherOne(
    coordSystemToInsert: CoordinateSystem,
    destinationCoordSystem: CoordinateSystem
  ): CoordinateSystem {
    const coordSysAfterInsertion = CoordinateSystem.fromTransformMatrix(
      MatrixUtils.multiplyM4(
        destinationCoordSystem.toTransformMatrix(),
        coordSystemToInsert.toTransformMatrix()
      )
    );
    return coordSysAfterInsertion;
  }

  /**
   * Bounding box is assumed to be always parallel to X,Y,Z axes (assuming that X,Y,Z = indices 0,1,2).
   * @param min values of minimal X,Y,Z coordinates
   * @param max values of maximal X,Y,Z coordinates
   * @returns lines which form the bounding box based on min and max values
   */
  static getLinesOfBoundingBox(min: Coords, max: Coords): Line3dt[] {
    const squares = [
      [
        [min[0], min[1], min[2]] as Coords,
        [min[0], max[1], min[2]] as Coords,
        [max[0], max[1], min[2]] as Coords,
        [max[0], min[1], min[2]] as Coords,
      ],
      [
        [min[0], min[1], max[2]] as Coords,
        [min[0], max[1], max[2]] as Coords,
        [max[0], max[1], max[2]] as Coords,
        [max[0], min[1], max[2]] as Coords,
      ],
    ];
    return [
      { firstPt: squares[0][0], secondPt: squares[0][1] },
      { firstPt: squares[0][1], secondPt: squares[0][2] },
      { firstPt: squares[0][2], secondPt: squares[0][3] },
      { firstPt: squares[0][3], secondPt: squares[0][0] },

      { firstPt: squares[1][0], secondPt: squares[1][1] },
      { firstPt: squares[1][1], secondPt: squares[1][2] },
      { firstPt: squares[1][2], secondPt: squares[1][3] },
      { firstPt: squares[1][3], secondPt: squares[1][0] },

      { firstPt: squares[0][0], secondPt: squares[1][0] },
      { firstPt: squares[0][1], secondPt: squares[1][1] },
      { firstPt: squares[0][2], secondPt: squares[1][2] },
      { firstPt: squares[0][3], secondPt: squares[1][3] },
    ];
  }

  /**
   * This function finds where 1 object (and precisely saying - its local Coordinate System), like a mesh, should be moved to,
   * so that its srcSnappingPointCS meets trgSnappingPointCS of a 2. object.
   * srcSnappingPointCS and trgSnappingPointCS are called in other programs anchors or connectors which should be glued to each other.
   * Let's call the 1st object - source and the 2nd object - target. source is moved while target doesn't change its position.
   * @param trgCS local Coordinate System of the target
   * @param srcSnappingPointCS some local coordinate system of the source object, given in local coordinates of the source object
   * @param trgSnappingPointCS some local coordinate system of the second object, given in local coordinates of the target object
   * @returns Coordinate System, where the Local CS of the source object should be moved to, so that srcSnappingPointCS = trgSnappingPointCS
   */
  static getPositionOfLocalCSAfterSnapping(
    trgCS: CoordinateSystem,
    srcSnappingPointCS: CoordinateSystem,
    trgSnappingPointCS: CoordinateSystem
  ): CoordinateSystem {
    //for Maths, see https://pl.wikipedia.org/wiki/Elementarne_macierze_transformacji
    //3 transformations must be done - the result is: [trgMeshMatrix] x [trgSnapPointMatrix] x [srcSnapPointMatrix]^-1
    const trgMeshMatrix = trgCS.toTransformMatrix();
    const srcSnapPointMatrix = srcSnappingPointCS.toTransformMatrix();
    const trgSnapPointMatrix = trgSnappingPointCS.toTransformMatrix();
    const srcSnapPointMatrixInv = MatrixUtils.inversedTransformMatrix(srcSnapPointMatrix);

    let transformMatrix = MatrixUtils.identityMatrix4();
    transformMatrix = MatrixUtils.multiplyM4(transformMatrix, trgMeshMatrix);
    transformMatrix = MatrixUtils.multiplyM4(transformMatrix, trgSnapPointMatrix);
    transformMatrix = MatrixUtils.multiplyM4(transformMatrix, srcSnapPointMatrixInv);

    const cs = CoordinateSystem.fromTransformMatrix(transformMatrix);
    return cs;
  }

  /**
    Description of the function may be found at https://github.com/Creoox/cxAssembler/tree/develop/ownDocs/stickingLines-maths;
    Generally it checks if the first pair of lines may stick to (and be included in) the second pair of lines
    @param tolerance determines required precision of calculations
    @returns tk and tl (translation in direction of the first and second line of the first pair of lines), if there is no solution then tk=undefined and tl=undefined
   */
  static getTranslationOfLinesToStickToAnotherLines(
    firstPairOfLines: PairOfLines,
    secondPairOfLines: PairOfLines,
    tolerance: number
  ): {
    translationFromFirstLineStartOfSecondPairOfLines?: number;
    translationFromSecondLineStartOfSecondPairOfLines?: number;
  } {
    const [Em, Sm] = [firstPairOfLines.firstLine.secondPt, firstPairOfLines.firstLine.firstPt];
    const m = MatrixUtils.sub(Em, Sm);
    //const em = MatrixUtils.normalize(m);
    const [En, Sn] = [firstPairOfLines.secondLine.secondPt, firstPairOfLines.secondLine.firstPt];
    const n = MatrixUtils.sub(En, Sn);
    //const en = MatrixUtils.normalize(n);
    const [Ek, Sk] = [secondPairOfLines.firstLine.secondPt, secondPairOfLines.firstLine.firstPt];
    const k = MatrixUtils.sub(Ek, Sk);
    const ek = MatrixUtils.normalize(k);
    const [El, Sl] = [secondPairOfLines.secondLine.secondPt, secondPairOfLines.secondLine.firstPt];
    const l = MatrixUtils.sub(El, Sl);
    const el = MatrixUtils.normalize(l);

    const d = MatrixUtils.sub(Sn, Sm);
    const D = MatrixUtils.sub(Sl, Sk);
    const Delta = MatrixUtils.sub(D, d);

    const scProd_ek_el = MatrixUtils.scalarProduct(ek, el);
    const denominator = 1 - scProd_ek_el * scProd_ek_el;
    let tk =
      denominator == 0
        ? undefined
        : (MatrixUtils.scalarProduct(Delta, ek) -
            MatrixUtils.scalarProduct(Delta, el) * scProd_ek_el) /
          denominator;
    let tl =
      denominator == 0
        ? undefined
        : -(
            MatrixUtils.scalarProduct(Delta, el) -
            MatrixUtils.scalarProduct(Delta, ek) * scProd_ek_el
          ) / denominator;

    //test if ek || m and el || n
    if (tk != undefined && tl != undefined) {
      if (
        MatrixUtils.lengthOf(MatrixUtils.crossProduct(ek, m)) > tolerance ||
        MatrixUtils.lengthOf(MatrixUtils.crossProduct(el, n)) > tolerance
      ) {
        tk = undefined;
        tl = undefined;
      }
    }

    if (tk != undefined && tl != undefined) {
      //coordinates of m' and n' endpoints:
      const kTranslation = MatrixUtils.multiplyBy(ek, tk);
      const lTranslation = MatrixUtils.multiplyBy(el, tl);
      const Smp = MatrixUtils.add(Sk, kTranslation);
      const Emp = MatrixUtils.add(Smp, m);
      const Snp = MatrixUtils.add(Sl, lTranslation);
      const Enp = MatrixUtils.add(Snp, n);
      const SkSmpVec = MatrixUtils.sub(Smp, Sk);
      const SkEmpVec = MatrixUtils.sub(Emp, Sk);
      const SlSnpVec = MatrixUtils.sub(Snp, Sl);
      const SlEnpVec = MatrixUtils.sub(Enp, Sl);

      //check if equation is satisfied:
      if (
        MatrixUtils.lengthOf(MatrixUtils.sub(MatrixUtils.add(Delta, lTranslation), kTranslation)) >
        tolerance
      ) {
        tk = undefined;
        tl = undefined;
      }

      //check of colinearity (probably doesn't have to be checked additionally)
      if (tk != undefined && tl != undefined) {
        if (
          MatrixUtils.lengthOf(MatrixUtils.crossProduct(ek, SkSmpVec)) > tolerance ||
          MatrixUtils.lengthOf(MatrixUtils.crossProduct(ek, SkEmpVec)) > tolerance ||
          MatrixUtils.lengthOf(MatrixUtils.crossProduct(el, SlSnpVec)) > tolerance ||
          MatrixUtils.lengthOf(MatrixUtils.crossProduct(el, SlEnpVec)) > tolerance
        ) {
          tk = undefined;
          tl = undefined;
        }
      }
      //check of inclusion:
      if (tk != undefined && tl != undefined) {
        const isValueBetween = (minLimit: number, value: number, maxLimit: number) => {
          return value >= minLimit - tolerance && value <= maxLimit + tolerance;
        };
        const kLength = MatrixUtils.lengthOf(k);
        const lLength = MatrixUtils.lengthOf(l);
        if (
          !isValueBetween(0, MatrixUtils.scalarProduct(ek, SkSmpVec), kLength) ||
          !isValueBetween(0, MatrixUtils.scalarProduct(ek, SkEmpVec), kLength) ||
          !isValueBetween(0, MatrixUtils.scalarProduct(el, SlSnpVec), lLength) ||
          !isValueBetween(0, MatrixUtils.scalarProduct(el, SlEnpVec), lLength)
        ) {
          tk = undefined;
          tl = undefined;
        }
      }
    }

    return {
      translationFromFirstLineStartOfSecondPairOfLines: tk,
      translationFromSecondLineStartOfSecondPairOfLines: tl,
    };
  }
}

export class Vector {
  private coords: Coords = MatrixUtils.zeroVector() as Coords;
  constructor(coords: Coords = MatrixUtils.zeroVector()) {
    this.coords = [...coords] as Coords;
    return this;
  }
  getCoords() {
    return [...this.coords] as Coords;
  }
  get(idx: number) {
    return this.coords[idx];
  }
  set(vec: Vector) {
    this.coords = [...vec.getCoords()];
    return this;
  }
  add(vec: Vector) {
    this.coords = MatrixUtils.add(this.coords, vec.coords) as Coords;
    return this;
  }
  sub(vec: Vector) {
    this.coords = MatrixUtils.sub(this.coords, vec.coords) as Coords;
    return this;
  }
  multiplyBy(factor: number) {
    this.coords = MatrixUtils.multiplyBy(this.coords, factor) as Coords;
    return this;
  }
  crossProduct(vec: Vector) {
    return new Vector(MatrixUtils.crossProduct(this.coords, vec.coords));
  }
  scalarProduct(vec: Vector) {
    return MatrixUtils.scalarProduct(this.coords, vec.coords);
  }
  length() {
    return MatrixUtils.lengthOf(this.coords);
  }
  normalize() {
    this.coords = MatrixUtils.normalize(this.coords);
    return this;
  }
  reverse() {
    this.coords = MatrixUtils.reverse(this.coords);
    return this;
  }
}
