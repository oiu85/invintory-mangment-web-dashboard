import { memo } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

// Chart theme based on dark mode
const getChartTheme = (isDark = false) => ({
  grid: isDark ? '#374151' : '#E5E7EB',
  text: isDark ? '#F3F4F6' : '#1F2937',
  background: isDark ? '#1F2937' : '#FFFFFF',
});

export const SalesLineChart = memo(({ data, isDark = false }) => {
  const theme = getChartTheme(isDark);
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data || []} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} />
        <XAxis dataKey="date" stroke={theme.text} />
        <YAxis stroke={theme.text} />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: theme.background, 
            border: `1px solid ${theme.grid}`,
            borderRadius: '8px',
          }} 
        />
        <Legend />
        <Line type="monotone" dataKey="count" stroke="#3B82F6" name="Sales Count" strokeWidth={2} />
        <Line type="monotone" dataKey="revenue" stroke="#10B981" name="Revenue ($)" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
});

SalesLineChart.displayName = 'SalesLineChart';

export const RevenueBarChart = memo(({ data, isDark = false }) => {
  const theme = getChartTheme(isDark);
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data || []} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} />
        <XAxis dataKey="date" stroke={theme.text} />
        <YAxis stroke={theme.text} />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: theme.background, 
            border: `1px solid ${theme.grid}`,
            borderRadius: '8px',
          }} 
        />
        <Legend />
        <Bar dataKey="revenue" fill="#3B82F6" name="Revenue ($)" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
});

RevenueBarChart.displayName = 'RevenueBarChart';

export const TopDriversChart = memo(({ data, isDark = false }) => {
  const theme = getChartTheme(isDark);
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data || []} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} />
        <XAxis type="number" stroke={theme.text} />
        <YAxis dataKey="name" type="category" width={100} stroke={theme.text} />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: theme.background, 
            border: `1px solid ${theme.grid}`,
            borderRadius: '8px',
          }} 
        />
        <Legend />
        <Bar dataKey="total_revenue" fill="#10B981" name="Revenue ($)" radius={[0, 8, 8, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
});

TopDriversChart.displayName = 'TopDriversChart';

export const SalesPieChart = memo(({ data, isDark = false }) => {
  const theme = getChartTheme(isDark);
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data || []}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {(data || []).map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ 
            backgroundColor: theme.background, 
            border: `1px solid ${theme.grid}`,
            borderRadius: '8px',
          }} 
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
});

SalesPieChart.displayName = 'SalesPieChart';

