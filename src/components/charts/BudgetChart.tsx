import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useTheme } from '@/theme-context';

interface BudgetItem {
  name: string;
  value: number;
  color: string;
}

interface BudgetChartProps {
  data: BudgetItem[];
  title?: string;
  description?: string;
  className?: string;
}

export function BudgetChart({ data, title = "Répartition du budget", description, className }: BudgetChartProps) {
  const { theme } = useTheme();
  const totalValue = data.reduce((acc, item) => acc + item.value, 0);
  
  // Styles adaptatifs selon le thème
  const themeStyles = {
    textColor: theme === 'dark' ? '#ffffff' : '#000000',
    tooltip: {
      backgroundColor: theme === 'dark' ? 'hsl(222.2, 47.4%, 11.2%)' : '#ffffff',
      borderColor: theme === 'dark' ? 'hsl(217.2, 32.6%, 17.5%)' : '#e2e8f0',
      textColor: theme === 'dark' ? '#ffffff' : '#000000',
    },
    legend: {
      textColor: theme === 'dark' ? '#ffffff' : '#000000',
    },
    chartBackground: {
      fill: theme === 'dark' ? 'hsl(222.2, 47.4%, 11.2%)' : '#ffffff',
    },
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="h-[350px] flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart
              style={{
                // Applique un fond transparent pour laisser le fond de la carte visible
                background: 'transparent',
              }}
            >
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                labelLine={false}
                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                  const radius = innerRadius + (outerRadius - innerRadius) * 1.1;
                  const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
                  const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);
                  
                  return (
                    <text 
                      x={x} 
                      y={y} 
                      fill={themeStyles.textColor}
                      textAnchor={x > cx ? 'start' : 'end'} 
                      dominantBaseline="central"
                      fontSize={12}
                      fontWeight={500}
                    >
                      {`${(percent * 100).toFixed(0)}%`}
                    </text>
                  );
                }}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [
                  `${value} MGA`, 
                  `(${((value as number / totalValue) * 100).toFixed(1)}%)`
                ]}
                contentStyle={{ 
                  backgroundColor: themeStyles.tooltip.backgroundColor,
                  borderColor: themeStyles.tooltip.borderColor,
                  borderWidth: 1,
                  borderRadius: 6,
                  padding: '12px',
                  color: themeStyles.tooltip.textColor,
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                }}
                itemStyle={{
                  color: themeStyles.tooltip.textColor,
                }}
              />
              <Legend 
                layout="horizontal" 
                verticalAlign="bottom" 
                align="center"
                wrapperStyle={{ 
                  paddingTop: '20px',
                  color: themeStyles.legend.textColor,
                }}
                formatter={(value) => (
                  <span style={{ color: themeStyles.legend.textColor }}>
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}