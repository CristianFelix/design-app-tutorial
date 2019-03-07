function LineChart(id, width = 300, height = 300, onBrush) {
    /**
     *  Config
     */
    const margin = { top: 20, right: 20, bottom: 20, left: 40 };
    const innerHeight = height - margin.top - margin.bottom;
    const innerWidth = width - margin.left - margin.right;

    /**
     *  Scales, transformers
     */
    const xScale = d3.scaleTime().range([0, innerWidth]);
    const yScale = d3.scaleLinear().range([innerHeight, 0]);

    const area = d3
        .area()
        .curve(d3.curveMonotoneX)
        .x(function(d) {
            return xScale(d.date);
        })
        .y0(innerHeight)
        .y1(function(d) {
            return yScale(d.price);
        });
    const xAxis = d3.axisBottom(xScale).ticks(5);
    const yAxis = d3.axisLeft(yScale);

    /**
     *  Create Elements
     */
    const svg = d3
        .select(`#${id}`)
        .attr("height", height)
        .attr("width", width);

    const body = svg
        .append("g")
        .attr("class", "focus")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    const path = body.append("path");
    const xAxisView = body
        .append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + innerHeight + ")");

    const yAxisView = body.append("g").attr("class", "axis axis--y");
    let brush = undefined;
    let brushG = undefined;
    if (onBrush) {
        brush = d3
            .brushX()
            .extent([[0, 0], [innerWidth, innerHeight]])
            .on("brush end", b => {
                if (
                    d3.event.sourceEvent &&
                    d3.event.sourceEvent.type === "zoom"
                )
                    return; // ignore brush-by-zoom
                var s = d3.event.selection.map(xScale.invert, xScale);
                onBrush(s);
            });
        brushG = body
            .append("g")
            .attr("class", "brush")
            .call(brush);
    }

    /**
     *  Update Function
     */
    let prevInfo = undefined;

    function update(data, selection) {
        if (prevInfo !== data) {
            xScale.domain(d3.extent(data, d => d.date));
            yScale.domain([0, d3.max(data, d => d.price)]);

            path.datum(data)
                .attr("class", "area")
                .attr("d", area);

            xAxisView.call(xAxis);
            yAxisView.call(yAxis);
            prevInfo = data;

            if (brushG && selection) {
                brushG.call(brush.move, selection.map(xScale, xScale));
            }
        }
    }
    return update;
}
