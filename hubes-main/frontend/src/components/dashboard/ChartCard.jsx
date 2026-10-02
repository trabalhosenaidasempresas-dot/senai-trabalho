import React, { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  useTheme,
  ToggleButton,
  ToggleButtonGroup,
  Button,
  IconButton,
  Tooltip as MuiTooltip,
  CircularProgress,
} from '@mui/material';
import { Line, Bar, Doughnut, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { motion } from 'framer-motion';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

const MotionCard = motion(Card);

export const ChartCard = ({
  title,
  type = 'line',
  data: originalData,
  height = 300,
  showFilters = true,
  enableExport = true,
  animationDelay = 0,
}) => {
  const theme = useTheme();
  const [selectedPeriod, setSelectedPeriod] = useState('30dias');
  const [isExporting, setIsExporting] = useState(false);
  const chartRef = React.useRef(null);

  // Gerar dados baseado no período selecionado
  const { data, periodLabel } = useMemo(() => {
    const periods = {
      hoje: { days: 1, label: 'Hoje' },
      '7dias': { days: 7, label: '7 Dias' },
      '30dias': { days: 30, label: '30 Dias' },
      '12meses': { days: 365, label: '12 Meses' },
    };

    const period = periods[selectedPeriod];
    let filteredData = { ...originalData };

    // Multiplicador baseado no período para simular dados diferentes
    const multiplier = {
      hoje: 0.2,
      '7dias': 0.5,
      '30dias': 1,
      '12meses': 2,
    }[selectedPeriod];

    if (filteredData.datasets) {
      filteredData.datasets = filteredData.datasets.map((dataset) => ({
        ...dataset,
        data:
          dataset.data instanceof Array
            ? dataset.data.map((val) => Math.round(val * multiplier))
            : dataset.data,
      }));
    }

    return { data: filteredData, periodLabel: period.label };
  }, [selectedPeriod, originalData]);

  // Configuração elegante do tooltip
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart',
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          color: theme.palette.text.secondary,
          font: { size: 12, weight: '500' },
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          generateLabels: (chart) => {
            const datasets = chart.data.datasets;
            return datasets.map((dataset, i) => ({
              text: dataset.label || `Dataset ${i}`,
              fillStyle: Array.isArray(dataset.backgroundColor)
                ? dataset.backgroundColor[0]
                : dataset.backgroundColor,
              strokeStyle: dataset.borderColor,
              lineWidth: dataset.borderWidth,
              hidden: false,
              index: i,
            }));
          },
        },
      },
      tooltip: {
        enabled: true,
        backgroundColor: theme.palette.mode === 'dark'
          ? 'rgba(0, 0, 0, 0.95)'
          : 'rgba(15, 23, 42, 0.95)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: theme.palette.primary.main,
        borderWidth: 2,
        padding: 16,
        displayColors: true,
        boxPadding: 8,
        titleFont: { size: 13, weight: 'bold' },
        bodyFont: { size: 12 },
        cornerRadius: 8,
        caretPadding: 12,
        boxBorderRadius: 8,
        usePointStyle: true,
        callbacks: {
          afterLabel: function (context) {
            const value = context.parsed.y || context.parsed;
            return `Total: ${value}`;
          },
          title: function (context) {
            return `📊 ${context[0].label}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: theme.palette.mode === 'dark'
            ? 'rgba(255, 255, 255, 0.05)'
            : 'rgba(0, 0, 0, 0.05)',
          drawTicks: false,
          lineWidth: 1,
        },
        ticks: {
          color: theme.palette.text.secondary,
          font: { size: 11 },
          padding: 8,
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: theme.palette.text.secondary,
          font: { size: 11 },
        },
      },
    },
  };

  // Renderizar gráfico com animação
  const renderChart = () => {
    switch (type) {
      case 'line':
        return <Line data={data} options={chartOptions} ref={chartRef} />;
      case 'bar':
        return <Bar data={data} options={chartOptions} ref={chartRef} />;
      case 'doughnut':
        return (
          <Doughnut
            data={data}
            options={{ ...chartOptions, maintainAspectRatio: true }}
            ref={chartRef}
          />
        );
      case 'pie':
        return (
          <Pie
            data={data}
            options={{ ...chartOptions, maintainAspectRatio: true }}
            ref={chartRef}
          />
        );
      default:
        return <Line data={data} options={chartOptions} ref={chartRef} />;
    }
  };

  // Exportar para PDF
  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const element = chartRef.current?.canvas;
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const imgWidth = 280;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.text(title, 15, 15, { fontSize: 16, fontStyle: 'bold' });
      pdf.text(`Período: ${periodLabel}`, 15, 25, { fontSize: 10 });
      pdf.addImage(imgData, 'PNG', 10, 35, imgWidth, imgHeight);
      pdf.save(`${title.replace(/\s+/g, '_')}_${selectedPeriod}.pdf`);
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // Exportar para Excel
  const handleExportExcel = () => {
    setIsExporting(true);
    try {
      const wsData = [
        [title],
        [`Período: ${periodLabel}`],
        [],
        ['Label', ...data.datasets.map((d) => d.label)],
        ...data.labels.map((label, idx) => [
          label,
          ...data.datasets.map((d) => d.data[idx]),
        ]),
      ];

      const ws = XLSX.utils.aoa_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Dados');

      // Estilos básicos
      ws['A1'].s = { font: { bold: true, sz: 14 } };

      XLSX.writeFile(
        wb,
        `${title.replace(/\s+/g, '_')}_${selectedPeriod}.xlsx`
      );
    } catch (error) {
      console.error('Erro ao exportar Excel:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <MotionCard
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animationDelay, duration: 0.5 }}
      sx={{
        borderRadius: 2.5,
        boxShadow: theme.palette.mode === 'dark'
          ? '0 2px 12px rgba(0, 0, 0, 0.3)'
          : '0 2px 12px rgba(0, 0, 0, 0.08)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        border: `1px solid ${theme.palette.divider}`,
        '&:hover': {
          boxShadow: theme.palette.mode === 'dark'
            ? '0 12px 32px rgba(0, 0, 0, 0.4)'
            : '0 12px 32px rgba(0, 0, 0, 0.15)',
          transform: 'translateY(-4px)',
        },
        overflow: 'hidden',
      }}
    >
      <CardHeader
        title={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: theme.palette.text.primary,
                fontSize: '1.1rem',
              }}
            >
              {title}
            </Typography>
          </Box>
        }
        action={
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            {showFilters && (
              <ToggleButtonGroup
                value={selectedPeriod}
                exclusive
                onChange={(e, value) => {
                  if (value !== null) setSelectedPeriod(value);
                }}
                size="small"
                sx={{
                  '& .MuiToggleButton-root': {
                    textTransform: 'none',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    border: `1px solid ${theme.palette.divider}`,
                    color: theme.palette.text.secondary,
                    '&.Mui-selected': {
                      backgroundColor: theme.palette.primary.main,
                      color: '#fff',
                      border: `1px solid ${theme.palette.primary.main}`,
                      '&:hover': {
                        backgroundColor: theme.palette.primary.dark,
                      },
                    },
                  },
                }}
              >
                <ToggleButton value="hoje">Hoje</ToggleButton>
                <ToggleButton value="7dias">7D</ToggleButton>
                <ToggleButton value="30dias">30D</ToggleButton>
                <ToggleButton value="12meses">12M</ToggleButton>
              </ToggleButtonGroup>
            )}

            {enableExport && (
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <MuiTooltip title="Exportar PDF">
                  <IconButton
                    size="small"
                    onClick={handleExportPDF}
                    disabled={isExporting}
                    sx={{
                      color: theme.palette.primary.main,
                      '&:hover': {
                        backgroundColor: `${theme.palette.primary.main}15`,
                      },
                    }}
                  >
                    {isExporting ? (
                      <CircularProgress size={20} />
                    ) : (
                      <PictureAsPdfIcon fontSize="small" />
                    )}
                  </IconButton>
                </MuiTooltip>
                <MuiTooltip title="Exportar Excel">
                  <IconButton
                    size="small"
                    onClick={handleExportExcel}
                    disabled={isExporting}
                    sx={{
                      color: '#4CAF50',
                      '&:hover': {
                        backgroundColor: '#4CAF5015',
                      },
                    }}
                  >
                    {isExporting ? (
                      <CircularProgress size={20} />
                    ) : (
                      <TableChartIcon fontSize="small" />
                    )}
                  </IconButton>
                </MuiTooltip>
              </Box>
            )}
          </Box>
        }
        sx={{
          pb: 2,
          pt: 2.5,
          px: 2.5,
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: `${theme.palette.primary.main}05`,
        }}
      />

      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ height, position: 'relative' }}>
          {renderChart()}
        </Box>
      </CardContent>
    </MotionCard>
  );
};

export default ChartCard;
