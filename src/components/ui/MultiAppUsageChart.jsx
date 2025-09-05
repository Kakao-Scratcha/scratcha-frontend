import React from 'react';
import Chart from './Chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from '../../utils/chartImports';

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

// 색상 팔레트 (다중 라인용)
const COLORS = [
    'rgb(59 130 246)',   // 파란색 (전체)
    'rgb(16 185 129)',   // 초록색
    'rgb(245 158 11)',   // 주황색
    'rgb(239 68 68)',    // 빨간색
    'rgb(139 92 246)',   // 보라색
    'rgb(236 72 153)',   // 핑크색
];

// 다중 앱 사용량 차트 컴포넌트
export default function MultiAppUsageChart({
    data,
    selectedPeriod = '전체',
    height = "h-80",
    margin = { top: 40, right: 12, bottom: 40, left: 12 },
    showGrid = true,
    allowDecimals = false,
    className = ""
}) {
    const xTickFormatter = createXTickFormatter(selectedPeriod);
    const formattedData = formatDataByPeriod(data, selectedPeriod);

    // 데이터에서 라인 키 추출 (date 제외) - 전체를 맨 앞에 정렬
    const lineKeys = formattedData.length > 0
        ? (() => {
            const keys = Object.keys(formattedData[0]).filter(key => key !== 'date');
            const totalKey = keys.find(key => key === '전체');
            const otherKeys = keys.filter(key => key !== '전체').sort();

            // '전체'를 맨 앞에, 나머지는 알파벳 순서로
            return totalKey ? [totalKey, ...otherKeys] : otherKeys;
        })()
        : [];

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
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'rgb(31 41 55)',
                        border: '1px solid rgb(75 85 99)',
                        borderRadius: '8px',
                        color: 'rgb(243 244 246)'
                    }}
                />
                <Legend
                    wrapperStyle={{
                        paddingTop: '20px',
                        fontSize: '12px',
                        color: 'rgb(156 163 175)'
                    }}
                />
                {lineKeys.map((key, index) => (
                    <Line
                        key={key}
                        type="monotone"
                        dataKey={key}
                        stroke={COLORS[index % COLORS.length]}
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                        connectNulls={false}
                        name={key}
                    />
                ))}
            </LineChart>
        </Chart>
    );
}
