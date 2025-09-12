import React from 'react';
import Chart from './Chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from '../../utils/chartImports';

// 커스텀 툴팁 컴포넌트
const CustomTooltip = ({ active, payload, label, appName }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
                <p className="text-gray-200 font-medium mb-2">
                    {label && label.length > 15 ? `${label.substring(0, 15)}...` : label}
                </p>
                {appName && (
                    <p className="text-sm" style={{ color: payload[0]?.color || 'rgb(96 165 250)' }}>
                        {appName.length > 15 ? `${appName.substring(0, 15)}...` : appName}: {payload[0]?.value}
                    </p>
                )}
            </div>
        );
    }
    return null;
};

// 기간별 X축 라벨 포맷터
const createXTickFormatter = (selectedPeriod) => (value) => {
    if (selectedPeriod === '당일') {
        // 'HH:00' → 'H시'
        const hh = parseInt(String(value).split(':')[0], 10);
        if (!Number.isNaN(hh)) return `${hh}시`;
        return value;
    }
    if (selectedPeriod === '7일' || selectedPeriod === '30일') {
        const m = value.match(/(\d+)월\s+(\d+)일/);
        if (m) return `${m[2]}일`;
        const parts = value.split('-');
        if (parts.length === 3) return `${parseInt(parts[2], 10)}일`;
        return value;
    }
    const m = value.match(/(\d+)년\s+(\d+)월/);
    if (m) return `${m[2]}월`;
    const parts = value.split('-');
    if (parts.length === 2) return `${parseInt(parts[1], 10)}월`;
    return value;
};

// 기간별 데이터 포맷터
const formatDataByPeriod = (data, selectedPeriod) => {
    if (!Array.isArray(data)) return data;

    return data.map(item => {
        const newItem = { ...item };

        // date 필드가 있고 날짜 형식인 경우 포맷팅
        if (item.date && typeof item.date === 'string') {
            if (selectedPeriod === '당일') {
                // 시간 형식 유지
                newItem.date = item.date;
            } else if (selectedPeriod === '7일' || selectedPeriod === '30일') {
                // '2024. 12. 15.' → '12월 15일'
                const dateMatch = item.date.match(/(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})\./);
                if (dateMatch) {
                    const [, , month, day] = dateMatch;
                    newItem.date = `${parseInt(month)}월 ${parseInt(day)}일`;
                }
            } else {
                // 전체 기간: '2024. 12. 15.' → '2024년 12월'
                const dateMatch = item.date.match(/(\d{4})\.\s*(\d{1,2})\.\s*(\d{1,2})\./);
                if (dateMatch) {
                    const [, year, month] = dateMatch;
                    newItem.date = `${year}년 ${parseInt(month)}월`;
                }
            }
        }

        return newItem;
    });
};

// 공통 사용량 차트 컴포넌트
export default function UsageChart({
    data,
    selectedPeriod = '전체',
    height = "h-80",
    dataKey = "usage",
    strokeColor = "rgb(96 165 250)",
    strokeWidth = 3,
    dotRadius = 4,
    activeDotRadius = 6,
    margin = { top: 40, right: 12, bottom: 40, left: 12 },
    showGrid = true,
    allowDecimals = false,
    className = "",
    appName = null
}) {
    const xTickFormatter = createXTickFormatter(selectedPeriod);
    const formattedData = formatDataByPeriod(data, selectedPeriod);

    return (
        <Chart height={height} className={className}>
            <LineChart data={formattedData} margin={margin}>
                {showGrid && (
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgb(156 163 175)"
                        vertical={true}
                    />
                )}
                <XAxis
                    dataKey="date"
                    stroke="rgb(156 163 175)"
                    fontSize={12}
                    tick={{ fill: 'rgb(156 163 175)' }}
                    interval={0}
                    minTickGap={0}
                    tickMargin={12}
                    tickFormatter={xTickFormatter}
                    allowDataOverflow={false}
                />
                <YAxis
                    stroke="rgb(156 163 175)"
                    fontSize={12}
                    tick={{ fill: 'rgb(156 163 175)' }}
                    allowDecimals={allowDecimals}
                    domain={[0, (dataMax) => (Math.max(1, dataMax))]}
                    allowDataOverflow={false}
                />
                <Tooltip content={(props) => <CustomTooltip {...props} appName={appName} />} />
                <Line
                    type="monotone"
                    dataKey={dataKey}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    dot={{ r: dotRadius }}
                    activeDot={{ r: activeDotRadius }}
                    connectNulls={false}
                />
            </LineChart>
        </Chart>
    );
}
