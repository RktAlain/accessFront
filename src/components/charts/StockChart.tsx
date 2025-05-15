import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, TooltipProps } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/theme-context';

interface StockItem {
  nom: string;
  quantite: number;
  seuil: number;
}

interface StockChartProps {
  data: StockItem[];
  title?: string;
  description?: string;
  className?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    const item = payload[0];
    return (
      <div className="bg-background p-3 border border-border rounded-lg shadow-sm">
        <p className="font-medium text-foreground">{label}</p>
        <p className="text-sm text-purple-500">Quantité: {item.value}</p>
        <p className="text-sm text-destructive">Seuil: {payload[1]?.value}</p>
      </div>
    );
  }

  return null;
};

export function StockChart({ data, title = "État des stocks", description, className }: StockChartProps) {
  const { theme } = useTheme();
  
  // Couleurs adaptatives selon le thème
  const textColor = theme === 'dark' ? '#ffffff' : 'hsl(240, 10%, 3.9%)';
  const mutedTextColor = theme === 'dark' ? 'hsl(0, 0%, 80%)' : 'hsl(240, 3.8%, 46.1%)';
  const gridColor = theme === 'dark' ? 'hsl(240, 3.7%, 25.9%)' : 'hsl(240, 4.9%, 83.9%)';
  
  // Couleurs des barres
  const barColors = {
    quantite: theme === 'dark' ? '#8b5cf6' : '#7c3aed', // Violet (plus clair en mode sombre)
    seuil: theme === 'dark' ? '#ef4444' : '#dc2626',    // Rouge
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 60,
            }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke={gridColor} 
            />
            <XAxis 
              dataKey="nom" 
              angle={-45} 
              textAnchor="end"
              tick={{ 
                fontSize: 12,
                fill: textColor,
              }}
              height={70}
              stroke={mutedTextColor}
            />
            <YAxis 
              stroke={mutedTextColor}
              tick={{ fill: textColor }}
            />
            <Tooltip 
              content={<CustomTooltip />}
              wrapperStyle={{
                outline: 'none',
              }}
            />
            <Bar 
              dataKey="quantite" 
              fill={barColors.quantite} 
              radius={[4, 4, 0, 0]} 
            />
            <Bar 
              dataKey="seuil" 
              fill={barColors.seuil} 
              radius={[4, 4, 0, 0]} 
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}