
/**
 * 可以理解为求圆边到中心点的距离
 *
 * 1、邻边(x) = sin(弧度) * r
 * 2、对边(y) = cos(弧度) * r
 *
 * @param {number} longRadio - 长半径
 * @param {number} shortRadio - 短半径
 * @param {number} gap - 节点的间隔
 */
function generateEllipse({ longRadio, shortRadio, gap = 1 }) {
    const data = [];
    for (let index = 0; index < 360; index = index + gap) {
        const radian = index * (Math.PI / 180); // 角度转弧度
        const x = (Math.cos(radian) * longRadio).toFixed(4) * 1;
        const y = (Math.sin(radian) * shortRadio).toFixed(4) * 1;
        data.push({ x, y });
    }
    return data;
}

/**
 * xy: 原本位置
 * XY: 转换后的位置
 * radian: 旋转的弧度，由角度转换而来
 * X(旋转后) = x * cos(radian) - y * sin(radian)
 * Y(旋转后) = x * sin(radian) + y * cos(radian)
 *
 * @param rotateAngle - 旋转角度
 * @param {{x:number,y:number}[]} ellipseVec - 椭圆矩阵集合
 */
function rotateEllipse(rotateAngle, ellipseVec) {
    const radian = rotateAngle * (Math.PI / 180);
    for (let i = 0; i < ellipseVec.length; i++) {
        const point = ellipseVec[i];
        const { x: rawX, y: rawY } = point;
        point.x = (rawX * Math.cos(radian) - rawY * Math.sin(radian)).toFixed(4) * 1;
        point.y = (rawX * Math.sin(radian) + rawY * Math.cos(radian)).toFixed(4) * 1;
    }
}

/**
 * 给定两点，返回他们之间的点
 * @param {{x:number,y:number}} p1
 * @param {{x:number,y:number}} p2
 * @param {number} count
 */
function lineToPoints(p1, p2, count = 100) {

    const k = (p2.x - p1.x === 0) ? 0 : (p2.y - p1.y) / (p2.x - p1.x);
    const xDist = (p2.x - p1.x) / count;
    const yDist = (p2.y - p1.y) / count;

    const data = [];
    for (let i = 1; i <= count; i++) {
        // 后面需要加上起始点
        const x = i * xDist;
        data.push({
            x: x + p1.x,
            y: (x === 0 ? i * yDist : k * x) + p1.y
        });
    }
    
    return data;
}
