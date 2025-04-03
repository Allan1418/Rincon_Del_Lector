"use client"

import { useEffect, useRef, useState } from "react"
import Chart from "chart.js/auto"
import styles from "./OwnerEarningsView.module.css"

const EarningsChart = ({ earningsData }) => {
  const chartRef = useRef(null)
  const chartInstance = useRef(null)
  const [chartType, setChartType] = useState("line")
  const [selectedYears, setSelectedYears] = useState([])
  const [showAllYears, setShowAllYears] = useState(true)

  const getMonthName = (monthNumber) => {
    const months = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ]
    return months[monthNumber - 1]
  }

  // Format currency in Colones
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("es-CR", {
      style: "currency",
      currency: "CRC",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  // Get all available years from data
  const getAvailableYears = () => {
    if (!earningsData || !earningsData.monthly_earnings) return []
    const years = new Set()
    earningsData.monthly_earnings.forEach((item) => years.add(item.year))
    return Array.from(years).sort((a, b) => b - a) // Sort descending
  }

  // Toggle year selection
  const toggleYear = (year) => {
    if (selectedYears.includes(year)) {
      setSelectedYears(selectedYears.filter((y) => y !== year))
    } else {
      setSelectedYears([...selectedYears, year])
    }
    setShowAllYears(false)
  }

  // Toggle all years
  const toggleAllYears = () => {
    if (showAllYears) {
      setSelectedYears([])
    } else {
      setSelectedYears([])
      setShowAllYears(true)
    }
  }

  useEffect(() => {
    if (!earningsData || !earningsData.monthly_earnings || earningsData.monthly_earnings.length === 0) {
      return
    }

    // Initialize selected years if empty
    if (selectedYears.length === 0 && !showAllYears) {
      const years = getAvailableYears()
      if (years.length > 0) {
        setSelectedYears([years[0]]) // Select most recent year by default
      }
    }

    // Organize data by year and month
    const yearMonthData = {}
    const years = new Set()

    earningsData.monthly_earnings.forEach((item) => {
      years.add(item.year)

      if (!yearMonthData[item.year]) {
        yearMonthData[item.year] = Array(12).fill(0)
      }

      yearMonthData[item.year][item.month - 1] = Number(item.total) || 0
    })

    const sortedYears = Array.from(years).sort()

    // Filter years based on selection
    const yearsToShow = showAllYears ? sortedYears : selectedYears

    // Prepare datasets for Chart.js
    const datasets = yearsToShow.map((year) => {
      // Generate a color based on the year
      const hue = (Number.parseInt(year) * 70) % 360

      return {
        label: `${year}`,
        data: yearMonthData[year],
        backgroundColor: chartType === "bar" ? `hsla(${hue}, 70%, 60%, 0.7)` : `hsla(${hue}, 70%, 60%, 0.2)`,
        borderColor: `hsla(${hue}, 70%, 50%, 1)`,
        borderWidth: 2,
        tension: 0.3,
        fill: chartType === "line",
        pointRadius: 4,
        pointHoverRadius: 7,
      }
    })

    // Destroy previous chart if it exists
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    // Create new chart
    const ctx = chartRef.current.getContext("2d")
    chartInstance.current = new Chart(ctx, {
      type: chartType,
      data: {
        labels: Array(12)
          .fill()
          .map((_, i) => getMonthName(i + 1)),
        datasets: datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 1000,
          easing: "easeOutQuart",
        },
        interaction: {
          mode: "index",
          intersect: false,
        },
        plugins: {
          legend: {
            position: "top",
            labels: {
              font: {
                size: 12,
              },
              usePointStyle: true,
              pointStyle: "circle",
            },
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                let label = context.dataset.label || ""
                if (label) {
                  label += ": "
                }
                if (context.parsed.y !== null) {
                  label += formatCurrency(context.parsed.y)
                }
                return label
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => formatCurrency(value),
            },
            grid: {
              color: "rgba(200, 200, 200, 0.2)",
            },
          },
          x: {
            grid: {
              color: "rgba(200, 200, 200, 0.2)",
            },
          },
        },
      },
    })

    // Cleanup function
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [earningsData, chartType, selectedYears, showAllYears])

  const availableYears = getAvailableYears()

  return (
    <div className={styles.chartContainer}>
      <div className={styles.chartControls}>
        <div className={styles.chartTypeSelector}>
          <button
            className={`${styles.chartTypeButton} ${chartType === "line" ? styles.activeChartType : ""}`}
            onClick={() => setChartType("line")}
          >
            Línea
          </button>
          <button
            className={`${styles.chartTypeButton} ${chartType === "bar" ? styles.activeChartType : ""}`}
            onClick={() => setChartType("bar")}
          >
            Barras
          </button>
        </div>

        <div className={styles.yearSelector}>
          <button className={`${styles.yearButton} ${showAllYears ? styles.activeYear : ""}`} onClick={toggleAllYears}>
            Todos
          </button>
          {availableYears.map((year) => (
            <button
              key={year}
              className={`${styles.yearButton} ${selectedYears.includes(year) && !showAllYears ? styles.activeYear : ""}`}
              onClick={() => toggleYear(year)}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.chartWrapper}>
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  )
}

export default EarningsChart

