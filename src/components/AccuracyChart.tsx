
import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { SIPP, PredictionCategory, getCategoryColor } from '@/data/sippData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, LabelList } from 'recharts';

interface AccuracyChartProps {
  sipp: SIPP;
}

interface CategoryData {
  name: string;
  value: number;
  color: string;
}

const AccuracyChart: React.FC<AccuracyChartProps> = ({ sipp }) => {
  const chartData: CategoryData[] = [
    { 
      name: 'Economy', 
      value: sipp.categoryAccuracy.economy,
      color: `hsl(var(--category-economy))` 
    },
    { 
      name: 'Politics', 
      value: sipp.categoryAccuracy.politics,
      color: `hsl(var(--category-politics))` 
    },
    { 
      name: 'Technology', 
      value: sipp.categoryAccuracy.technology,
      color: `hsl(var(--category-technology))` 
    },
    { 
      name: 'Foreign Policy', 
      value: sipp.categoryAccuracy.foreign_policy,
      color: `hsl(var(--category-foreign-policy))` 
    },
    { 
      name: 'Social Trends', 
      value: sipp.categoryAccuracy.social_trends,
      color: `hsl(var(--category-social-trends))` 
    }
  ].sort((a, b) => b.value - a.value);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 bg-white shadow-lg rounded-md border">
          <p className="font-medium">{payload[0].payload.name}</p>
          <p className="text-sm">Accuracy: <span className="font-medium">{payload[0].value.toFixed(1)}</span>/3</p>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = (props: any) => {
    const { x, y, width, value } = props;
    return (
      <g>
        <text 
          x={x + width + 5} 
          y={y + 4} 
          fill="#888" 
          fontSize={12}
          textAnchor="start"
        >
          {value.toFixed(1)}
        </text>
      </g>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full h-64 mt-4"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 50, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
          <XAxis 
            type="number" 
            domain={[0, 3]} 
            tickCount={4} 
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            type="category" 
            dataKey="name" 
            tick={{ fontSize: 12 }} 
            width={100}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="value" 
            radius={[0, 4, 4, 0]} 
            animationDuration={1500}
            animationBegin={300}
          >
            {chartData.map((entry, index) => (
              <motion.rect
                key={`bar-${index}`}
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 0.8, delay: 0.1 * index, ease: "easeOut" }}
                fill={entry.color}
              />
            ))}
            <LabelList dataKey="value" content={<CustomLabel />} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default AccuracyChart;
