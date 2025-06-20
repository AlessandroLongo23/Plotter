export class RasterContours {
    constructor() {}

    getContours(fn, xmin, xmax, ymin, ymax, dx, dy, useAdaptive = true, maxLevels = 3) {
        try {
            if (useAdaptive) {
                return this.getAdaptiveContours(fn, xmin, xmax, ymin, ymax, dx, dy, maxLevels);
            } else {
                // Fallback to original optimized approach
                const gridValues = this.precomputeGridValues(fn, xmin, xmax, ymin, ymax, dx, dy);
                
                const contours = [];
                const numCellsX = Math.floor((xmax - xmin) / dx);
                const numCellsY = Math.floor((ymax - ymin) / dy);
                
                for (let j = 0; j < numCellsY; j++) {
                    for (let i = 0; i < numCellsX; i++) {
                        const x = xmin + i * dx;
                        const y = ymin + j * dy;
                        
                        const tl = gridValues[j][i];
                        const tr = gridValues[j][i + 1];
                        const bl = gridValues[j + 1][i];
                        const br = gridValues[j + 1][i + 1];

                        let squareContours = this.getContour(tl, tr, bl, br, x, y, dx, dy, fn);
                        contours.push(...squareContours);
                    }
                }
                
                return contours;
            }
        } catch (e) {
            console.error(e);
            return [];
        }
    }

    getAdaptiveContours(fn, xmin, xmax, ymin, ymax, initialDx, initialDy, maxLevels) {
        // Start with a coarse grid - use larger initial cell size
        const coarseFactor = Math.pow(2, maxLevels - 1);
        const coarseDx = initialDx * coarseFactor;
        const coarseDy = initialDy * coarseFactor;
        
        const contours = [];
        const refinementQueue = [];
        
        // Initial coarse scan
        const numCellsX = Math.ceil((xmax - xmin) / coarseDx);
        const numCellsY = Math.ceil((ymax - ymin) / coarseDy);
        
        for (let j = 0; j < numCellsY; j++) {
            for (let i = 0; i < numCellsX; i++) {
                const x = xmin + i * coarseDx;
                const y = ymin + j * coarseDy;
                const actualDx = Math.min(coarseDx, xmax - x);
                const actualDy = Math.min(coarseDy, ymax - y);
                
                if (actualDx <= 0 || actualDy <= 0) continue;
                
                const tl = eval(fn)(x, y);
                const tr = eval(fn)(x + actualDx, y);
                const bl = eval(fn)(x, y + actualDy);
                const br = eval(fn)(x + actualDx, y + actualDy);
                
                // Check if this cell contains a contour
                if (this.cellHasContour(tl, tr, bl, br)) {
                    refinementQueue.push({
                        x, y, dx: actualDx, dy: actualDy,
                        level: 0, targetLevel: maxLevels - 1,
                        values: { tl, tr, bl, br }
                    });
                }
            }
        }
        
        // Process refinement queue
        while (refinementQueue.length > 0) {
            const cell = refinementQueue.shift();
            
            if (cell.level >= cell.targetLevel || 
                (cell.dx <= initialDx && cell.dy <= initialDy)) {
                // At target resolution, generate contours
                const cellContours = this.getContour(
                    cell.values.tl, cell.values.tr, 
                    cell.values.bl, cell.values.br,
                    cell.x, cell.y, cell.dx, cell.dy, fn
                );
                contours.push(...cellContours);
            } else {
                // Refine this cell using optimized subdivision
                const subCells = this.optimizedSubdivision(
                    cell.x, cell.y, cell.dx, cell.dy, 
                    cell.values, fn
                );
                
                for (const subCell of subCells) {
                    if (this.cellHasContour(subCell.values.tl, subCell.values.tr, 
                                           subCell.values.bl, subCell.values.br)) {
                        refinementQueue.push({
                            ...subCell,
                            level: cell.level + 1,
                            targetLevel: cell.targetLevel
                        });
                    }
                }
            }
        }
        
        return contours;
    }

    cellHasContour(tl, tr, bl, br) {
        // Check if there's a sign change (zero crossing) indicating a contour
        const signs = [tl > 0, tr > 0, bl > 0, br > 0];
        const allPositive = signs.every(s => s);
        const allNegative = signs.every(s => !s);
        return !(allPositive || allNegative);
    }

    optimizedSubdivision(x, y, dx, dy, values, fn) {
        const { tl, tr, bl, br } = values;
        
        // Calculate gradients to determine optimal subdivision direction
        const horizontalGradient = Math.abs((tr - tl) + (br - bl)) / 2;
        const verticalGradient = Math.abs((bl - tl) + (br - tr)) / 2;
        
        // Determine subdivision strategy based on gradient analysis
        const gradientRatio = horizontalGradient / (verticalGradient + 1e-10);
        
        if (gradientRatio > 2.0) {
            // Predominantly horizontal variation - subdivide vertically
            return this.subdivideVertically(x, y, dx, dy, values, fn);
        } else if (gradientRatio < 0.5) {
            // Predominantly vertical variation - subdivide horizontally  
            return this.subdivideHorizontally(x, y, dx, dy, values, fn);
        } else {
            // Mixed gradients - use traditional 4-way subdivision
            return this.subdivideIntoFour(x, y, dx, dy, values, fn);
        }
    }

    subdivideVertically(x, y, dx, dy, values, fn) {
        const { tl, tr, bl, br } = values;
        const halfDy = dy / 2;
        
        // Evaluate middle edge values
        const ml = eval(fn)(x, y + halfDy);
        const mr = eval(fn)(x + dx, y + halfDy);
        
        return [
            {
                x, y, dx, dy: halfDy,
                values: { tl, tr, bl: ml, br: mr }
            },
            {
                x, y: y + halfDy, dx, dy: halfDy,
                values: { tl: ml, tr: mr, bl, br }
            }
        ];
    }

    subdivideHorizontally(x, y, dx, dy, values, fn) {
        const { tl, tr, bl, br } = values;
        const halfDx = dx / 2;
        
        // Evaluate middle edge values
        const mt = eval(fn)(x + halfDx, y);
        const mb = eval(fn)(x + halfDx, y + dy);
        
        return [
            {
                x, y, dx: halfDx, dy,
                values: { tl, tr: mt, bl, br: mb }
            },
            {
                x: x + halfDx, y, dx: halfDx, dy,
                values: { tl: mt, tr, bl: mb, br }
            }
        ];
    }

    subdivideIntoFour(x, y, dx, dy, values, fn) {
        const { tl, tr, bl, br } = values;
        const halfDx = dx / 2;
        const halfDy = dy / 2;
        
        // Evaluate all edge midpoints and center
        const mt = eval(fn)(x + halfDx, y);
        const mr = eval(fn)(x + dx, y + halfDy);
        const mb = eval(fn)(x + halfDx, y + dy);
        const ml = eval(fn)(x, y + halfDy);
        const center = eval(fn)(x + halfDx, y + halfDy);
        
        return [
            {
                x, y, dx: halfDx, dy: halfDy,
                values: { tl, tr: mt, bl: ml, br: center }
            },
            {
                x: x + halfDx, y, dx: halfDx, dy: halfDy,
                values: { tl: mt, tr, bl: center, br: mr }
            },
            {
                x, y: y + halfDy, dx: halfDx, dy: halfDy,
                values: { tl: ml, tr: center, bl, br: mb }
            },
            {
                x: x + halfDx, y: y + halfDy, dx: halfDx, dy: halfDy,
                values: { tl: center, tr: mr, bl: mb, br }
            }
        ];
    }

    precomputeGridValues(fn, xmin, xmax, ymin, ymax, dx, dy) {
        const numPointsX = Math.floor((xmax - xmin) / dx) + 1;
        const numPointsY = Math.floor((ymax - ymin) / dy) + 1;
        
        const gridValues = [];
        
        for (let j = 0; j < numPointsY; j++) {
            const row = [];
            for (let i = 0; i < numPointsX; i++) {
                const x = xmin + i * dx;
                const y = ymin + j * dy;
                row.push(eval(fn)(x, y));
            }
            gridValues.push(row);
        }
        
        return gridValues;
    }

    getContour(tl, tr, bl, br, x, y, dx, dy, fn = null, maxDepth = 3, currentDepth = 0) {
        // Convert to binary representation for marching squares
        // 1 = positive, 0 = negative/zero
        let config = 0;
        if (tl > 0) config |= 8; // 1000
        if (tr > 0) config |= 4; // 0100
        if (bl > 0) config |= 2; // 0010
        if (br > 0) config |= 1; // 0001

        // Handle cases with no contour
        if (config === 0 || config === 15) {
            return [];
        }

        // Handle ambiguous cases (opposite corners same sign) with subdivision
        if ((config === 6 || config === 9) && fn && currentDepth < maxDepth) {
            return this.subdivideSquare(x, y, dx, dy, fn, maxDepth, currentDepth + 1);
        }

        // Calculate interpolated points on edges
        const points = this.getInterpolatedPoints(tl, tr, bl, br, x, y, dx, dy);

        // Return line segments based on configuration
        switch (config) {
            case 1:  // 0001 - br positive
                return [[points.bottom, points.right]];
            case 2:  // 0010 - bl positive  
                return [[points.left, points.bottom]];
            case 3:  // 0011 - bl, br positive
                return [[points.left, points.right]];
            case 4:  // 0100 - tr positive
                return [[points.top, points.right]];
            case 5:  // 0101 - tr, br positive
                return [[points.top, points.bottom]];
            case 6:  // 0110 - tr, bl positive (ambiguous - should be subdivided)
                return [[points.top, points.left], [points.bottom, points.right]];
            case 7:  // 0111 - tr, bl, br positive
                return [[points.top, points.left]];
            case 8:  // 1000 - tl positive
                return [[points.left, points.top]];
            case 9:  // 1001 - tl, br positive (ambiguous - should be subdivided)
                return [[points.left, points.top], [points.bottom, points.right]];
            case 10: // 1010 - tl, bl positive
                return [[points.top, points.bottom]];
            case 11: // 1011 - tl, bl, br positive
                return [[points.top, points.right]];
            case 12: // 1100 - tl, tr positive
                return [[points.left, points.right]];
            case 13: // 1101 - tl, tr, br positive
                return [[points.left, points.bottom]];
            case 14: // 1110 - tl, tr, bl positive
                return [[points.bottom, points.right]];
            default:
                return [];
        }
    }

    subdivideSquare(x, y, dx, dy, fn, maxDepth, currentDepth) {
        const halfDx = dx / 2;
        const halfDy = dy / 2;
        let contours = [];

        // Subdivide into 4 smaller squares
        const subSquares = [
            [x, y],                    // top-left
            [x + halfDx, y],           // top-right
            [x, y + halfDy],           // bottom-left
            [x + halfDx, y + halfDy]   // bottom-right
        ];

        for (let [sx, sy] of subSquares) {
            let tl = fn(sx, sy);
            let tr = fn(sx + halfDx, sy);
            let bl = fn(sx, sy + halfDy);
            let br = fn(sx + halfDx, sy + halfDy);

            let subContours = this.getContour(tl, tr, bl, br, sx, sy, halfDx, halfDy, fn, maxDepth, currentDepth);
            contours.push(...subContours);
        }

        return contours;
    }

    getInterpolatedPoints(tl, tr, bl, br, x, y, dx, dy) {
        return {
            top: [this.interpolate(x, x + dx, tl, tr), y],
            right: [x + dx, this.interpolate(y, y + dy, tr, br)],
            bottom: [this.interpolate(x + dx, x, br, bl), y + dy],
            left: [x, this.interpolate(y + dy, y, bl, tl)]
        };
    }

    interpolate(a, b, valueA, valueB) {
        if (valueA === valueB) return (a + b) / 2; // Avoid division by zero
        return a + (b - a) * (-valueA) / (valueB - valueA);
    }
}