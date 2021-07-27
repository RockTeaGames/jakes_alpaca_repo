function createTheChart(
    plot_bars,
    plot_EMA12,
    plot_EMA26,
    plot_MACD,
    plot_MACDsignal,
    plot_MACDgo
  ) {
    document.getElementById("topChart").innerHTML = "";
    document.getElementById("botChart").innerHTML = "";
    //const chartHeight = document.getElementById("topChart").clientHeight ;
    //console.log(chartHeight);
    const topchart = LightweightCharts.createChart(
      document.getElementById("topChart"),
      {
        //width: chartWidth,
        //height: chartHeight,
        layout: {
          backgroundColor: "rgba(0, 0, 0, 0)",
          textColor: "rgba(0, 0, 0, 1)",
        },
        grid: {
          vertLines: {
            color: "rgba(100, 100, 100, 0.5)",
            style: LightweightCharts.LineStyle.Dotted,
          },
          horzLines: {
            color: "rgba(100, 100, 100, 0.5)",
            style: LightweightCharts.LineStyle.Dotted,
          },
        },
      }
    );
    //topchart.timeScale().fitContent();
    topchart.applyOptions({
      timeScale: {
        timeVisible: true,
      },
    });
  
    const botchart = LightweightCharts.createChart(
      document.getElementById("botChart"),
      {
        //width: chartWidth,
        //height: chartHeight,
        layout: {
          backgroundColor: "rgba(0, 0, 0, 0)",
          textColor: "rgba(0, 0, 0, 1)",
        },
        grid: {
          vertLines: {
            color: "rgba(100, 100, 100, 0.5)",
            style: LightweightCharts.LineStyle.Dotted,
          },
          horzLines: {
            color: "rgba(100, 100, 100, 0.5)",
            style: LightweightCharts.LineStyle.Dotted,
          },
        },
      }
    );
    //botchart.timeScale().fitContent();
    botchart.applyOptions({
      timeScale: {
        timeVisible: true,
      },
    });
  
    const barsSeries = topchart.addLineSeries({
      color: "rgba(0,75,30,1)",
      //title: theStock,
    });
    barsSeries.setData(plot_bars);
  
    const EMA12Series = topchart.addLineSeries({
      color: "rgba(200,75,0,1)",
      //title: "EMA12",
    });
    EMA12Series.setData(plot_EMA12);
  
    const EMA26Series = topchart.addLineSeries({
      color: "rgba(0,100,200,1)",
      //title: "EMA26",
    });
    EMA26Series.setData(plot_EMA26);
  
    const MACDSeries = botchart.addLineSeries({
      color: "rgba(75, 100, 200,1)",
      //title: "MACD"
    });
    MACDSeries.setData(plot_MACD);
  
    const MACDSignalSeries = botchart.addLineSeries({
      color: "rgba(200, 100, 75,1)",
      //title: "MACDSignal"
    });
    MACDSignalSeries.setData(plot_MACDsignal);
  
    const MACDGoSeries = botchart.addHistogramSeries({
      //title: "MACDGo"
    });
    MACDGoSeries.setData(plot_MACDgo);
  }