/**
 * 绘画图纸：坐标纸
 * 时间：2018年5月28日15:04:03
 * 作者：成龙哥哥
 */
'use strict';

CLASS(
    'coordinate.paper',
    param => {
        //引用的模块
        const svg = NEW_ASYNC(ejs.root + 'svg/svg');//svg操作类

        //变量定义
        let option = {};    //用户配置的参数
        let shot = {};      //简化链式查找
        let chartSize = {}; //图表大小
        let data = {};      //数据容器
        let dataTemp = {};
        let yAxisData = []; //y轴数据
        let xAxisData = []; //x轴数据
        let maxData = 0;    //数据最大值
        let minData = 0;    //数据最小值
        let yAxisMin = 0;   //y轴最小值
        let yAxisMax = 0;   //y轴最大值
        let yStrWidth = 0;  //y轴字符长度
        let yTickWidth = 0; //y轴刻度线长度
        let yAxisSpace = 0; //y方向的空间
        let xStrHeight = 0; //x轴字符高度
        let xTickHeight = 0;//x轴刻度高度
        let xAxisSpace = 0; //x方向轴空间
        let yAxisStart = {};//y轴逻辑起点
        let axisLength = {};//坐标轴长度
        let span = 10;      //y轴分段值
        let spanValue = 0;  //y轴单段值
        let spanHeight = 0; //y轴高度值
        let oIndex = -1;    //原点所在的索引
        let interval = 0;   //实际间隔
        let O = {};         //逻辑原点
        let xSpan = 0;
        let xAxisPoint = [];
        let yAxisPoint = [];
        let sheetMap = new Map();//样式
        let eventMap = new Map();//事件
        let chartPartMap = new Map();
        let detailG = null;
        let stickLeft = null;
        let stickRight = null;
        let svgDom = null;
        let thumWidth = 0;
        let userFn = null;
        let IteratorNode = null;
        let detailHeight = 0;//底部细节轴


        //【参数补全机制】
        option = ejs.assignDeep({
            style: {
                //位置
                position: {
                    top: param.theme.fontSize,
                    right: param.theme.fontSize,
                    bottom: param.theme.fontSize,
                    left: param.theme.fontSize
                },
                /*position: {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0
                },*/
                //坐标轴
                axis: {
                    //x轴
                    x: {
                        display: param.theme.display,
                        //轴线
                        line: {
                            display: param.theme.display,
                            borderColor: 'rgba(0,0,0,1)',
                            borderWidth: 2,
                            borderStyle: 'solid',//dashed
                        },
                        //坐标刻度线
                        tick: {
                            display: param.theme.display,
                            height: 10,
                            borderWidth: 2,
                            borderColor: 'rgba(0,0,0,1)'
                        },
                        //文本
                        label: {
                            display: param.theme.display,
                            fontSize: param.theme.fontSize,
                            lineHeight: param.theme.fontSize,
                            color: 'rgba(0,0,0,1)',
                            fontWeight: 'normal',
                            fontFamily: '\'Microsoft YaHei\',sans-serif',
                            align: 'center'
                        }
                    },
                    //y轴
                    y: {
                        display: param.theme.display,
                        //轴线
                        line: {
                            display: param.theme.display,
                            borderColor: 'rgba(0,0,0,1)',
                            borderWidth: 2,
                            borderSyle: 'solid',//dashed
                        },
                        //坐标刻度线
                        tick: {
                            display: param.theme.display,
                            width: 10,
                            borderWidth: 2,
                            borderColor: 'rgba(0,0,0,1)'
                        },
                        //文本
                        label: {
                            display: param.theme.display,
                            fontSize: param.theme.fontSize,
                            lineHeight: param.theme.fontSize,
                            color: 'rgba(0,0,0,1)',
                            fontWeight: 'normal',
                            fontFamily: '\'Microsoft YaHei\',sans-serif',
                            align: 'center'
                        }
                    },
                    //原点
                    origin: {
                        display: param.theme.display,
                        point: {
                            display: param.theme.display,
                            borderColor: 'rgba(0,0,0,1)',
                            borderWidth: 2,
                            width: 5,
                            background: 'rgba(255,255,255,1)',
                            marginTop: 20,
                            marginRight: 20
                        },
                        //文本
                        label: {
                            display: param.theme.display,
                            content: 'O',
                            fontSize: param.theme.fontSize,
                            lineHeight: 20,
                            color: 'rgba(0,0,0,1)',
                            fontWeight: 'normal',
                            fontFamily: '\'Microsoft YaHei\',sans-serif',
                            align: 'center'
                        }
                    },
                    //网格线
                    grid: {
                        display: param.theme.display,
                        x: {
                            borderWidth: 1,
                            borderColor: 'rgba(0,0,0,0.2)',
                            display: param.theme.display
                        },
                        y: {
                            borderWidth: 1,
                            borderColor: 'rgba(0,0,0,0.1)',
                            display: param.theme.display
                        }
                    },
                    //辅助
                    guild: {
                        //指示器
                        pointer: {},
                        //悬浮窗
                        tooltip: {
                            //线
                            line: {
                                /*css rule*/
                            },
                            //
                            box: {}
                        },
                    }
                },
                //图例
                legend: {
                    //标题
                    title: {
                        /*css rule*/
                    },
                    //图例项
                    item: {
                        //标志
                        marker: {
                            /*css rule*/
                        },
                        //文本
                        label: {
                            /*css rule*/
                        }
                    }
                }
            }
        }, param);


        //【简化链式查找】
        shot = {
            //取样
            capacity: option.capacity,

            //细节
            detail: option.detail,

            offsetSize: option.offsetSize,

            //定位
            position: option.style.position,

            //x轴系列
            axisX: option.style.axis.x,
            xLine: option.style.axis.x.line,
            xTick: option.style.axis.x.tick,
            xLabel: option.style.axis.x.label,

            //y轴系列
            axisY: option.style.axis.y,
            yLine: option.style.axis.y.line,
            yTick: option.style.axis.y.tick,
            yLabel: option.style.axis.y.label,


            //坐标原点
            origin: option.style.axis.origin,
            originPoint: option.style.axis.origin.point,
            originLabel: option.style.axis.origin.label,

            //网格线
            grid: option.style.axis.grid,
            xGrid: option.style.axis.grid.x,
            yGrid: option.style.axis.grid.y
        };


        //图表大小
        chartSize = {
            width: shot.offsetSize.width - shot.position.left - shot.position.right,
            height: shot.offsetSize.height - shot.position.top - shot.position.bottom
        };

        //【数据容器】
        data = option.data;
        if (shot.capacity) {
            //小视区
            thumWidth = chartSize.width / 10;
            let p = Math.ceil(thumWidth / (chartSize.width - yAxisSpace) * 100) / 100;//slice
            let length = data.key.length * p;
            data = {
                key: data.key.slice(0, length),
                value: data.value.slice(0, length),
            };
            data = capacity(data);
            detailHeight = 30;
        }

        function initChart() {
            //重置
            xAxisPoint = [];
            yAxisPoint = [];
            yAxisData = [];

            //【最值】
            maxData = ejs.arrMaxMin(data.value, 'max');
            minData = ejs.arrMaxMin(data.value, 'min');
            maxData = maxData <= 0 ? 0 :maxData;
            minData = minData >= 0 ? 0 : minData;

            //【最小最小】
            yAxisMin = Math.floor(minData / 10) * 10;
            yAxisMax = Math.ceil(maxData / 10) * 10;


            //寻找0位置的索引，用来确定存在负值时x轴的位置金和原点
            for (let i = 0; true; i += span) {
                let num = yAxisMin + i;
                yAxisData.push(num);
                if (oIndex === -1 && num >= 0) oIndex = i / span;
                if (num >= yAxisMax) break;
            }

//            console.log(oIndex);

            //【y轴配置display变化引发的影响合计】
            if (shot.yLabel.display !== 'none') {
                let //y轴最大文本宽度
                    yMinStrWidth = ejs.strLength(ejs.arrMaxMin(yAxisData, 'min').toString()) * shot.yLabel.fontSize / 1.25,
                    yMaxStrWidth = ejs.strLength(ejs.arrMaxMin(yAxisData, 'max').toString()) * shot.yLabel.fontSize / 1.25;

                yStrWidth = yMinStrWidth > yMaxStrWidth ? yMinStrWidth : yMaxStrWidth
            }
            //坐标刻度线
            yTickWidth = shot.yTick.display !== 'none' ? shot.yTick.width : 0;
            if (shot.axisY.display === 'none')
                yStrWidth = yTickWidth = 0;
            yAxisSpace = yStrWidth + yTickWidth;


            //【x轴配置display变化引发的影响合计】
            xStrHeight = shot.xLabel.display !== 'none' ? shot.xLabel.lineHeight * 1.25 : 0;
            //坐标刻度线
            xTickHeight = shot.xTick.display !== 'none' ? shot.xTick.height : 0;
            if (shot.axisX.display === 'none')
                xStrHeight = xTickHeight = 0;
            xAxisSpace = xStrHeight + xTickHeight + detailHeight;


            //【逻辑起点】
            yAxisStart = {
                //x位
                x: yAxisSpace + shot.position.left,
                //y位
                y: shot.offsetSize.height - shot.position.bottom - xAxisSpace
            };

            //【坐标轴长度】
            axisLength = {
                x: chartSize.width - yAxisSpace,
                y: chartSize.height - xAxisSpace
            };
            //【y轴分段】
            spanValue = (yAxisMax - yAxisMin) / span;
            spanHeight = axisLength.y / spanValue;

            //【段值】


            //【间隔】
            interval = yAxisData.length > 10 ? Math.round(yAxisData.length / 10) : 0;


            //【逻辑原点】
            O = {
                //x位
                x: yAxisStart.x,
                //y位
                y: yAxisStart.y - oIndex * spanHeight
            };


            //【刻度点】
            xAxisData = data.key;
            xSpan = axisLength.x / (xAxisData.length + 1);
            for (let i = 1; i < xAxisData.length + 1; ++i)
                xAxisPoint.push(X(xSpan * i));
            for (let i = 0; i < spanValue + 1; ++i) {
                yAxisPoint.push(yAxisStart.y - spanHeight * i);
            }

        }

        /**
         * 数据取样
         * 取样算法：根据图表实际大小和指定的像素密度换算取数据段和数据段的取样个数。
         *          找出每段样本间隔中的最大值和最小值和x轴对应的y标值（特征值），根据图表的实际大小取出一批值丰富折线的平缓度（细节值）。
         *          这样可以保证数据精度，保留并且累积原始数据的变化率
         */
        function capacity(datas) {
            //获取取样点
            let px = 10,//像素
                //图表被分为了多少段
                pxCount = chartSize.width / px;
            //数据也同样分capacity多段，在本段数据中进行取样
            let capacity = Math.ceil(datas.key.length / pxCount);

            //过滤数据
            data = {key: [], value: []};
            for (let index = 0; index < datas.key.length - capacity; index += capacity) {
                //执行取值
                //取样点超过两个才有取样的意义，因为每单位数据都要保留至少两个值，最大值和最小值
                if (capacity > 2) {
                    //取样数据段
                    let
                        //取样数据段的value段
                        valueSpan = datas.value.slice(index, index + capacity),
                        //取样数据段的key段，这个要和value段对应上并保证顺序不变
                        keySpan = datas.key.slice(index, index + capacity);

                    //取样段内最值
                    let
                        max = ejs.arrMaxMin(valueSpan, 'max', 'index'),
                        min = ejs.arrMaxMin(valueSpan, 'min', 'index');

                    //保序数组，用来保证每单位数据段顺序的数组，每段数据保证则全部数据就可以保证顺序
                    let
                        orderValueArr = new Array(valueSpan.length),
                        orderKeyArr = new Array(valueSpan.length);

                    //用来丰富细节的值的个数，最多10个
                    let dataNumInSpan = px / 2;
                    let orderValueSpan = Math.ceil(valueSpan.length / dataNumInSpan);
                    for (let i = 0; i < orderValueArr.length; i += orderValueSpan) {
                        orderValueArr[i] = valueSpan[i];
                        orderKeyArr[i] = keySpan[i];
                    }

                    //最大值
                    orderValueArr[max.index] = max.value;
                    orderKeyArr[max.index] = keySpan[max.index];

                    //最小值
                    orderValueArr[min.index] = min.value;
                    orderKeyArr[min.index] = keySpan[min.index];

                    //洗掉保序数组中的无用索引
                    /*let valueArr = [...new Set(Array.from(orderValueArr))].filter(val => val !== undefined),
                        keyArr = [...new Set(Array.from(orderKeyArr))].filter(val => val !== undefined);*/
                    let valueArr = orderValueArr.filter(val => val !== undefined),
                        keyArr = orderKeyArr.filter(val => val !== undefined);

                    //给数据容器value赋值
                    data.value.push(...valueArr);
                    data.key.push(...keyArr);
                } else {
                    data.key.push(datas.key[index]);
                    data.value.push(datas.value[index]);
                }
            }

            //x轴不用全部画出来
            let tickSpan = Math.floor(5 * px * data.key.length / chartSize.width) + 1;
            for (let i = 0; i < data.key.length; ++i) {
                if (i % tickSpan) data.key[i] = '';
            }
            return data;
        }

        //【svg坐标转逻辑正向笛卡尔坐标】
        function X(x) {
            return x + O.x;
        }

        function Y(y) {
            return O.y - y;
        }

        /**
         * 坐标轴生成器
         * @returns {*}
         */
        function drawAxis() {
            let xAxis = null,
                yAxis = null;

            //x轴
            if (shot.xLine.display !== 'none' && shot.axisX.display !== 'none') {
                //let xAxisClazz = ejs.simple();
                xAxis = svg.draw('line', {
                    x1: O.x,
                    y1: O.y,
                    x2: axisLength.x + O.x,
                    y2: O.y
                });

                //ejs.addClass(xAxis, xAxisClazz);

                //设置默认样式
                /*sheetMap.set('.' + xAxisClazz, {
                    stroke: shot.xLine.borderColor,
                    strokeWidth: shot.xLine.display !== 'none' ? shot.xLine.borderWidth : 0
                });*/

                //xAxis

                ejs.css(xAxis, {
                    stroke: shot.xLine.borderColor,
                    strokeWidth: shot.xLine.display !== 'none' ? shot.xLine.borderWidth : 0
                });

                if (shot.xLine.borderStyle === 'solid') {

                } else if (shot.xLine.borderStyle === 'dashed') {
                    sheetMap.get('.' + xAxisClazz).strokeDasharray = shot.xLine.borderWidth * 4 + "," + shot.xLine.borderWidth * 4
                } else {
                    sheetMap.get('.' + xAxisClazz).strokeDasharray = shot.xLine.borderStyle
                }
            }


            //y轴
            if (shot.yLine.display !== 'none' && shot.axisY.display !== 'none') {
                //let yAxisClazz = ejs.simple();
                yAxis = svg.draw('line', {
                    x1: O.x,
                    y1: yAxisStart.y,
                    x2: O.x,
                    y2: shot.position.top
                });

                //ejs.addClass(yAxis, yAxisClazz);

                //设置默认样式
                /*sheetMap.set('.' + yAxisClazz, {
                    stroke: shot.yLine.borderColor,
                    strokeWidth: shot.yLine.display !== 'none' ? shot.yLine.borderWidth : 0,
                });*/

                ejs.css(yAxis, {
                    stroke: shot.yLine.borderColor,
                    strokeWidth: shot.yLine.display !== 'none' ? shot.yLine.borderWidth : 0,
                });

            }


            //目前将x轴和y轴混合到一块
            return svg.g([xAxis, yAxis]);
        }

        /**
         * 坐标原点
         * @returns {[null,null]}
         */
        function drawOrigin() {
            let circle = null,
                text = null;

            if (shot.origin.display !== 'none') {
                //圆形
                if (shot.originPoint.display !== 'none') {
                    let OClazz = ejs.simple();
                    circle = svg.draw('circle', {
                        cx: O.x,
                        cy: O.y,
                        r: shot.originPoint.width
                    });
                    ejs.addClass(circle, OClazz);
                    sheetMap.set('.' + OClazz, {
                        stroke: shot.originPoint.borderColor,
                        strokeWidth: shot.originPoint.borderWidth,
                        fill: shot.originPoint.background
                    });
                }


                //文本 originLabel.content
                if (shot.originLabel.display !== 'none') {
                    let OTextClazz = ejs.simple();
                    text = svg.create('text', {
                        x: O.x - shot.originPoint.marginTop,
                        y: O.y + shot.originPoint.marginRight,
                    });
                    ejs.addClass(text, OTextClazz);

                    sheetMap.set('.' + OTextClazz, {
                        fill: shot.originLabel.color,
                        fontSize: shot.originLabel.fontSize,
                        lineHeight: shot.originLabel.lineHeight,
                        fontWeight: shot.originLabel.fontWeight,
                        fontFamily: shot.originLabel.fontFamily,
                        textAnchor: shot.originLabel.align === 'left' ? 'end' : shot.originLabel.align === 'right' ? 'start' : 'middle'
                    });

                    text.textContent = shot.originLabel.content;
                }
            }


            return svg.g([circle, text]);
        }

        /**
         * 刻度线
         * @returns {*|number}
         */
        function drawTick() {
            let xTickG = null,
                yTickG = null;

            //x轴刻度
            if (shot.xTick.display !== 'none' && shot.axisX.display !== 'none') {
                let xTickArr = [];
                let xTickNode = svg.draw('line', {
                    y1: yAxisStart.y,
                    y2: yAxisStart.y + xTickHeight
                });
                xAxisPoint.forEach((v, i) => {
                    if (xAxisData[i]) {
                        xTickArr.push(ejs.attr(xTickNode.cloneNode(), {
                            x1: v,
                            x2: v
                        }))
                    }
                });
                xTickG = svg.g(xTickArr);
                ejs.css(xTickG, {
                    stroke: shot.xTick.borderColor,
                    strokeWidth: shot.xTick.borderWidth,
                });
            }

            //y轴刻度
            if (shot.yTick.display !== 'none' && shot.axisY.display !== 'none') {
                let yTickArr = [];
                let yTickNode = svg.draw('line', {
                    x1: X(0) - yTickWidth,
                    x2: X(0)
                });

                yAxisPoint.forEach((v, i) => {
                    if (!(i % interval)) {
                        yTickArr.push(ejs.attr(yTickNode.cloneNode(), {
                            y1: v,
                            y2: v
                        }))
                    }
                });
                yTickG = svg.g(yTickArr);
                ejs.css(yTickG, {
                    stroke: shot.yTick.borderColor,
                    strokeWidth: shot.yTick.borderWidth
                });
            }
            //x刻度和y刻度,目前混合到一块处理
            return svg.g([xTickG, yTickG]);
        }


        /**
         * 坐标文本
         * @returns {*|number}
         */
        function drawAxisLabel() {
            let xAxisLabelG = null,
                yAxisLabelG = null;

            if (shot.xLabel.display !== 'none' && xAxisSpace) {
                let xAxisLabelArr = [];
                //let xAxisLabelClazz = ejs.simple();
                //x轴文本
                let xAxisLabelNode = svg.create('text', {
                    y: yAxisStart.y + xTickHeight + xStrHeight / 1.25,
                    fontSize: shot.xLabel.fontSize
                });

                /*sheetMap.set('.' + xAxisLabelClazz, {
                    fill: shot.xLabel.color,
                    lineHeight: xStrHeight,
                    fontWeight: shot.xLabel.fontWeight,
                    fontFamily: shot.xLabel.fontFamily,
                    textAnchor: shot.xLabel.align === 'left' ? 'end' : shot.xLabel.align === 'right' ? 'start' : 'middle'
                });*/


                xAxisPoint.forEach((v, i) => {
                    let cloneNode = xAxisLabelNode.cloneNode();
                    if (xAxisData[i]) {
                        cloneNode.textContent = xAxisData[i];
                        ejs.attr(cloneNode, {x: v});
                        xAxisLabelArr.push(cloneNode);
                    }
                });
                xAxisLabelG = svg.g(xAxisLabelArr);
                ejs.css(xAxisLabelG, {
                    fill: shot.xLabel.color,
                    lineHeight: xStrHeight,
                    fontWeight: shot.xLabel.fontWeight,
                    fontFamily: shot.xLabel.fontFamily,
                    textAnchor: shot.xLabel.align === 'left' ? 'end' : shot.xLabel.align === 'right' ? 'start' : 'middle'
                });
                //ejs.addClass(xAxisLabelG, xAxisLabelClazz);
            }

            if (shot.yLabel.display !== 'none' && yAxisSpace) {
                let yAxisLabelArr = [];
                //let yAxisLabelClazz = ejs.simple();
                let yAxisLabelNode = svg.create('text', {
                    x: X(0) - yTickWidth - yStrWidth / 2,
                    fontSize: shot.yLabel.fontSize
                });
                /*sheetMap.set('.' + yAxisLabelClazz, {
                    fill: shot.yLabel.color,
                    fontWeight: shot.yLabel.fontWeight,
                    fontFamily: shot.yLabel.fontFamily,
                    textAnchor: shot.yLabel.align === 'left' ? 'end' : shot.yLabel.align === 'right' ? 'start' : 'middle'
                });*/

                yAxisPoint.forEach((v, i) => {
                    if (!(i % interval)) {
                        let cloneNode = yAxisLabelNode.cloneNode();
                        cloneNode.textContent = yAxisData[i];
                        ejs.attr(cloneNode, {y: v + shot.yLabel.lineHeight / 5});
                        yAxisLabelArr.push(cloneNode);
                    }
                });
                yAxisLabelG = svg.g(yAxisLabelArr);
                ejs.css(yAxisLabelG, {
                    fill: shot.yLabel.color,
                    fontWeight: shot.yLabel.fontWeight,
                    fontFamily: shot.yLabel.fontFamily,
                    textAnchor: shot.yLabel.align === 'left' ? 'end' : shot.yLabel.align === 'right' ? 'start' : 'middle'
                });
                //ejs.addClass(yAxisLabelG, yAxisLabelClazz);
            }

            return svg.g([xAxisLabelG, yAxisLabelG]);
        }

        /**
         * 网格线
         * @returns {*|number}
         */
        function drawGrid() {
            let xGridG = null, yGridG = null;

            if (shot.grid.display !== 'none') {
                //纵向
                if (shot.xGrid.display !== 'none') {
                    //let xGridClazz = ejs.simple();
                    let xGridArr = [];
                    let xGridNode = svg.draw('line', {
                        y1: yAxisStart.y,
                        y2: yAxisStart.y - axisLength.y
                    });
                    /*sheetMap.set('.' + xGridClazz, {
                        stroke: shot.xGrid.borderColor,
                        strokeWidth: shot.xGrid.borderWidth,
                    });*/

                    xAxisPoint.forEach((v, i) => {
                        if (xAxisData[i]) {
                            xGridArr.push(ejs.attr(xGridNode.cloneNode(), {
                                x1: v,
                                x2: v
                            }))
                        }
                    });
                    xGridG = svg.g(xGridArr);
                    ejs.css(xGridG, {
                        stroke: shot.xGrid.borderColor,
                        strokeWidth: shot.xGrid.borderWidth,
                    });
                    //ejs.addClass(xGridG, xGridClazz);
                }

                //横向
                if (shot.yGrid.display !== 'none') {
                    //let yGridClazz = ejs.simple();
                    let yGridArr = [];
                    let yGridNode = svg.draw('line', {
                        x1: X(0),
                        x2: axisLength.x + O.x
                    });
                    /*sheetMap.set('.' + yGridClazz, {
                        stroke: shot.yGrid.borderColor,
                        strokeWidth: shot.yGrid.borderWidth,
                    });*/

                    yAxisPoint.forEach((v, i) => {
                        if (!(i % Math.round(interval / 2))) {
                            yGridArr.push(ejs.attr(yGridNode.cloneNode(), {
                                y1: v,
                                y2: v
                            }))
                        }
                    });
                    yGridG = svg.g(yGridArr);
                    //ejs.addClass(yGridG, yGridClazz);
                    ejs.css(yGridG, {
                        stroke: shot.yGrid.borderColor,
                        strokeWidth: shot.yGrid.borderWidth
                    });
                }
            }


            //x刻度和y刻度,目前混合到一块处理
            return svg.g([xGridG, yGridG]);
        }

        /**
         * 重新摘要数据并产生图纸
         */
        function reloadData() {
            let
                start = Math.floor((((ejs.attr(stickLeft, 'x') - (shot.position.left + yAxisSpace)) / (chartSize.width - yAxisSpace))) * 100) / 100,
                end = Math.ceil(((ejs.attr(stickRight, 'x') - (shot.position.left + yAxisSpace)) / (chartSize.width - yAxisSpace)) * 100) / 100;
            let startIndex = option.data.value.length * start,
                endIndex = option.data.value.length * end;
            data = capacity({
                value: option.data.value.slice(startIndex, endIndex),
                key: option.data.key.slice(startIndex, endIndex)
            });
            //清除图纸图形
            chartPartMap.forEach((v, i) => {
                if (i !== 'detail') {
                    ejs.remove(v);
                    chartPartMap.delete(i);
                }
            });
            //清除用户图形
            IteratorNode.forEach(v => ejs.remove(v));

            //【重新绘制】
            initChart();
            IteratorNode = userFn({figure: figure()});

            chartPartMap = new Map([
                ['axis', drawAxis()],
                ['origin', drawOrigin()],
                ['tick', drawTick()],
                ['axisLabel', drawAxisLabel()],
                ['grid', drawGrid()]
            ]);

            let chartPartArray = [];
            chartPartMap.forEach(v => chartPartArray.push(v));
            ejs.appendBatch(svgDom, [...chartPartArray, ...IteratorNode]);
        }

        /**
         * 细节展示
         */
        function drawDetail() {
            if (shot.capacity) {
                detailG = svg.g();
                //边框
                let marginTop = shot.axisX.tick.height / 2;
                let border = svg.create('rect', {
                    x: shot.position.left + yAxisSpace,
                    y: chartSize.height - detailHeight + shot.position.top + marginTop,
                    width: chartSize.width - yAxisSpace,
                    height: detailHeight - marginTop,
                    strokeLocation: 'inside',
                    strokeWidth: 1,
                    stroke: '#000',
                    fill: 'none'
                });

                //【最值】
                let maxData = ejs.arrMaxMin(option.data.value, 'max'),
                    minData = ejs.arrMaxMin(option.data.value, 'min');
                minData = minData >= 0 ? 0 : minData;

                //【最大最小】
                let yAxisMin = Math.floor(minData / 10) * 10,
                    yAxisMax = Math.ceil(maxData / 10) * 10;

                //寻找0位置的索引，用来确定存在负值时x轴的位置金和原点
                let oIndex = -1;
                for (let i = 0; true; i += span) {
                    let num = yAxisMin + i;
                    if (oIndex === -1 && num >= 0) oIndex = i / span;
                    if (num >= yAxisMax) break;
                }

                //【y轴分段】
                let spanValue = (yAxisMax - yAxisMin) / span,
                    spanHeight = axisLength.y / spanValue;
                let O = {
                    //x位
                    x: yAxisStart.x,
                    //y位
                    y: yAxisStart.y - oIndex * spanHeight
                };

                //数据关键点
                let linePoint = [];
                let xSpan = axisLength.x / (option.data.key.length + 1);
                option.data.value.forEach((v, i) => linePoint.push({
                    x: xSpan * i + O.x,
                    y: O.y - v * (spanHeight / span)
                }));

                //划线
                let line = svg.draw('lines', {d: linePoint}, {
                    strokeWidth: 2,
                    stroke: '#000'
                });
                ejs.attr(line, {
                    transform:
                    'translate(0, ' + (chartSize.height - detailHeight + shot.position.top + marginTop) + ') ' +
                    'scale(1,' + ((detailHeight) / chartSize.height) + ')',
                });

                //中间
                let thumX = shot.position.left + yAxisSpace;
                let thum = svg.create('rect', {
                    x: thumX,
                    y: chartSize.height - detailHeight + shot.position.top + marginTop,
                    width: thumWidth,
                    height: detailHeight - marginTop,
                    fill: 'rgba(0,0,0,.2)',
                    cursor: 'move'
                });

                //左右扩大选区
                let stickWidth = 10;
                let stick = svg.create('rect', {
                    y: chartSize.height - detailHeight + shot.position.top + marginTop,
                    width: stickWidth,
                    height: detailHeight - marginTop,
                    fill: 'rgba(0,0,0,.5)'
                });
                stickLeft = stick.cloneNode();
                stickRight = stick.cloneNode();
                ejs.attr(stickLeft, {
                    x: thumX,
                    cursor: 'w-resize'
                });
                ejs.attr(stickRight, {
                    x: thumX + thumWidth - stickWidth,
                    cursor: 'e-resize'
                });

                //TODO 有内存泄漏隐患
                //鼠标按下
                thum.onmousedown = v => {
                    let s = v.clientX;
                    thumWidth = parseFloat(ejs.attr(thum, 'width'));
                    let _thumX = parseFloat(ejs.attr(thum, 'x')),
                        _stickLeftX = parseFloat(ejs.attr(stickLeft, 'x')),
                        _stickRightX = parseFloat(ejs.attr(stickRight, 'x'));
                    ejs.body.onmousemove = b => {
                        let move = b.clientX - s;

                        //回到到起点
                        if (_thumX + move < thumX) {
                            ejs.attr(thum, {x: thumX});
                            //两边
                            ejs.attr(stickLeft, {x: thumX});
                            ejs.attr(stickRight, {x: thumX + thumWidth - stickWidth});
                            return;
                        }
                        //回到到终点
                        if (_thumX + move > axisLength.x + O.x - thumWidth) {
                            ejs.attr(thum, {x: axisLength.x + O.x - thumWidth});
                            //两边
                            ejs.attr(stickLeft, {x: axisLength.x + O.x - thumWidth});
                            ejs.attr(stickRight, {x: axisLength.x + O.x - stickWidth});
                            return;
                        }

                        //没有到达端尽头
                        //中间
                        ejs.attr(thum, {x: _thumX + move});
                        //两边
                        ejs.attr(stickLeft, {x: _stickLeftX + move});
                        ejs.attr(stickRight, {x: _stickRightX + move});
                        //重新摘要全部数据
                        reloadData();
                    }
                };

                //左箭头被拉动
                stickLeft.onmousedown = v => {
                    let s = v.clientX;
                    let x = parseFloat(ejs.attr(stickLeft, 'x'));
                    let _thumX = parseFloat(ejs.attr(thum, 'x'));
                    thumWidth = parseFloat(ejs.attr(thum, 'width'));
                    ejs.body.onmousemove = b => {
                        let move = b.clientX - s;
                        //回到起点
                        if (_thumX + move < thumX) {
                            ejs.attr(thum, {width: parseFloat(ejs.attr(stickRight, 'x')) - thumX});//长度
                            ejs.attr(thum, {x: thumX});//位置
                            ejs.attr(stickLeft, {x: thumX});
                            return;
                        }
                        //回到终点
                        if (x + move >= parseFloat(ejs.attr(stickRight, 'x'))) {
                            ejs.attr(thum, {width: 0});
                            ejs.attr(stickLeft, {x: parseFloat(ejs.attr(stickRight, 'x'))});
                            return;
                        }
                        ejs.attr(thum, {width: thumWidth - move});//长度
                        ejs.attr(thum, {x: _thumX + move});//位置
                        ejs.attr(stickLeft, {x: move + x});
                        //重新摘要全部数据
                        reloadData();
                    }
                };

                //右箭头被拉动
                stickRight.onmousedown = v => {
                    let s = v.clientX;
                    let x = parseFloat(ejs.attr(stickRight, 'x'));
                    thumWidth = parseFloat(ejs.attr(thum, 'width'));
                    ejs.body.onmousemove = b => {
                        let move = b.clientX - s;
                        //回到到终点
                        if (move + x > axisLength.x + O.x - stickWidth) {
                            ejs.attr(thum, {width: axisLength.x + O.x - parseFloat(ejs.attr(stickLeft, 'x'))});
                            ejs.attr(stickRight, {x: axisLength.x + O.x - stickWidth});
                            return;
                        }
                        //回到起点
                        if (x + move <= parseFloat(ejs.attr(stickLeft, 'x'))) {
                            ejs.attr(thum, {width: 0});
                            ejs.attr(stickRight, {x: parseFloat(ejs.attr(stickLeft, 'x'))});
                            return;
                        }
                        ejs.attr(thum, {width: thumWidth + move});
                        ejs.attr(stickRight, {x: move + x});

                        //重新摘要全部数据
                        reloadData();
                    }
                };


                //鼠标抬起
                ejs.body.onmouseup = () => ejs.body.onmousemove = null;

                return ejs.appendBatch(detailG, [
                    border,
                    line,
                    svg.g([thum, stickLeft, stickRight])
                ]);
            }
        }

        /**
         * 计算关键点
         * */
        function figure() {
            //数据关键点
            let linePoint = [];
            data.value.forEach((v, i) => {
                linePoint.push({
                    value: v,
                    x: xAxisPoint[i],
                    y: Y(0) - v * (spanHeight / span)
                });
            });

            //坐标关键点
            let xPoint = [],
                yPoint = [];
            xAxisPoint.forEach(v => {
                xPoint.push({x: v, y: Y(0)})
            });
            yAxisPoint.forEach(v => yPoint.push({x: X(0), y: v}));

            return {
                //数据关键点
                dataPoints: linePoint,
                maxMinData: {
                    max: maxData,
                    min: minData
                },
                axisStartEnd: {
                    xAxis: {
                        start: O,
                        end: {
                            x: axisLength.x + O.x,
                            y: O.y
                        }
                    },
                    yAxis: {
                        start: {
                            x: O.x,
                            y: yAxisStart.y
                        },
                        end: {
                            x: O.x,
                            y: yAxisStart.y - axisLength.y
                        }
                    },
                },
                O: O,
                //坐标轴关键点
                axisPoints: {
                    x: xPoint,
                    y: yPoint
                },
                //坐标轴间隔
                axisSpan: {
                    x: xSpan,
                    y: spanHeight
                },
                size: axisLength
            };
        }

        function initPaper(svgNode, fn) {
            //【保存函数句柄】
            userFn = fn;
            //【保存SVG句柄】
            svgDom = svgNode;

            //【内置样式表】
            let sheet = svg.sheet(svgNode);

            //【生成样式表】
            sheetMap.forEach((v, k) => svg.setSheet(sheet, k, v));

            //【1初始化图表】
            initChart();

            //【2生成部件】
            chartPartMap = new Map([
                ['axis', drawAxis()],
                ['origin', drawOrigin()],
                ['tick', drawTick()],
                ['axisLabel', drawAxisLabel()],
                ['grid', drawGrid()],
                ['detail', drawDetail()]
            ]);

            //【3组装节点】
            IteratorNode = userFn({figure: figure()});
            let chartPartArray = [];
            chartPartMap.forEach(v => chartPartArray.push(v));
            ejs.appendBatch(svgDom, [...chartPartArray, ...IteratorNode]);

            //【4显示svg】
            ejs.css(svgDom, {display: 'block'});
        }


        //【公共方法】
        let publicFn = {
            //option: option,
            //chartPartMap: chartPartMap,
            //sheetMap: sheetMap,
            //eventMap: eventMap,
            //figure: figure(),
            //X: X,
            //Y: Y,
            initPaper: initPaper
        };

        //危险属性屏蔽
        //Object.defineProperty(publicFn, 'chartPartMap', {enumerable: false});
        //Object.defineProperty(publicFn, 'sheetMap', {enumerable: false});
        //Object.defineProperty(publicFn, 'eventMap', {enumerable: false});

        return publicFn;
    }
);