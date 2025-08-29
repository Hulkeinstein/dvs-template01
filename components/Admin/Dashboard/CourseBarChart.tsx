'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Series } from '@/types/dashboard';

interface Props {
  data: Series[];
}

const CourseBarChart: React.FC<Props> = ({ data }) => {
  return (
    <div className="rbt-dashboard-content bg-color-white rbt-shadow-box mb--60">
      <div className="content">
        <div className="section-title mb--30">
          <h4 className="rbt-title-style-3">Top Courses by Enrollment</h4>
          <p className="b3 text-muted">Most popular courses</p>
        </div>

        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11 }}
                stroke="#999"
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis tick={{ fontSize: 12 }} stroke="#999" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Bar
                dataKey="value"
                fill="#ff6b6b"
                name="Enrollments"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default CourseBarChart;
