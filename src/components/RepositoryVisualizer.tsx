import { useEffect, useRef } from 'react';
import { GitState } from '../types/git';
import { motion } from 'framer-motion';
import * as d3 from 'd3';

interface RepositoryVisualizerProps {
  gitState: GitState;
}

interface Node {
  id: string;
  message: string;
  branch: string;
  x?: number;
  y?: number;
  fx?: number | null;
  fy?: number | null;
  timestamp: number;
}

interface Link {
  source: string;
  target: string;
  branch: string;
}

const RepositoryVisualizer = ({ gitState }: RepositoryVisualizerProps) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    // Xóa nội dung cũ
    d3.select(svgRef.current).selectAll("*").remove();

    // Tạo dữ liệu cho biểu đồ
    const nodes: Node[] = gitState.commits.map(commit => ({
      id: commit.id,
      message: commit.message,
      branch: gitState.branches.find(b => b.commits.includes(commit.id))?.name || 'detached',
      timestamp: commit.timestamp
    }));

    // Tạo links dựa trên parent commit
    const links: Link[] = gitState.commits
      .filter(commit => commit.parent)
      .map(commit => ({
        source: commit.id,
        target: commit.parent!,
        branch: gitState.branches.find(b => b.commits.includes(commit.id))?.name || 'detached'
      }));

    // Thiết lập kích thước SVG
    const width = containerRef.current.clientWidth;
    const height = 400;
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height]);

    // Thêm gradient cho đường nối
    const gradient = svg.append('defs')
      .append('linearGradient')
      .attr('id', 'link-gradient')
      .attr('gradientUnits', 'userSpaceOnUse');

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#3B82F6');

    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#8B5CF6');

    // Tạo force simulation
    const simulation = d3.forceSimulation<Node>(nodes)
      .force('link', d3.forceLink<Node, Link>(links).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('x', d3.forceX(width / 2).strength(0.1))
      .force('y', d3.forceY(height / 2).strength(0.1));

    // Vẽ các đường nối
    const link = svg.append('g')
      .selectAll('path')
      .data(links)
      .join('path')
      .attr('class', 'git-link')
      .attr('stroke', d => getBranchColor(d.branch))
      .attr('stroke-width', 3)
      .attr('fill', 'none')
      .attr('marker-end', 'url(#arrow)');

    // Tạo arrow marker cho mỗi branch
    gitState.branches.forEach(branch => {
      svg.append('defs').append('marker')
        .attr('id', `arrow-${branch.name}`)
        .attr('viewBox', '0 -5 10 10')
        .attr('refX', 20)
        .attr('refY', 0)
        .attr('markerWidth', 6)
        .attr('markerHeight', 6)
        .attr('orient', 'auto')
        .append('path')
        .attr('d', 'M0,-5L10,0L0,5')
        .attr('fill', getBranchColor(branch.name));
    });

    // Container cho mỗi node
    const node = svg.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .attr('class', 'git-node')
      .call(d3.drag<SVGGElement, Node>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    // Thêm hình tròn cho node
    node.append('circle')
      .attr('r', 24)
      .attr('fill', d => getBranchColor(d.branch))
      .attr('stroke', '#fff')
      .attr('stroke-width', 3)
      .attr('class', 'transition-all duration-200')
      .on('mouseover', function() {
        d3.select(this)
          .attr('r', 28)
          .attr('stroke-width', 4);
      })
      .on('mouseout', function() {
        d3.select(this)
          .attr('r', 24)
          .attr('stroke-width', 3);
      });

    // Thêm commit hash
    node.append('text')
      .attr('dy', -30)
      .attr('text-anchor', 'middle')
      .attr('class', 'text-xs font-mono')
      .text(d => d.id.slice(0, 7));

    // Thêm commit message
    node.append('text')
      .attr('dy', 40)
      .attr('text-anchor', 'middle')
      .attr('class', 'text-sm font-medium')
      .text(d => d.message.slice(0, 20));

    // Thêm timestamp
    node.append('text')
      .attr('dy', 60)
      .attr('text-anchor', 'middle')
      .attr('class', 'text-xs text-base-content/60')
      .text(d => new Date(d.timestamp).toLocaleTimeString());

    // Thêm branch tag
    node.append('g')
      .attr('transform', 'translate(0, -45)')
      .each(function(d) {
        const branchTag = d3.select(this);
        const branch = gitState.branches.find(b => b.commits.includes(d.id));
        if (branch) {
          const tag = branchTag.append('g');
          tag.append('rect')
            .attr('x', -40)
            .attr('y', -12)
            .attr('width', 80)
            .attr('height', 24)
            .attr('rx', 12)
            .attr('fill', getBranchColor(branch.name))
            .attr('opacity', 0.2);
          tag.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', 5)
            .attr('class', 'text-xs font-semibold')
            .attr('fill', getBranchColor(branch.name))
            .text(branch.name);
        }
      });

    // Cập nhật vị trí các phần tử
    simulation.on('tick', () => {
      link.attr('d', d => {
        const sourceNode = nodes.find(n => n.id === d.source);
        const targetNode = nodes.find(n => n.id === d.target);
        if (!sourceNode || !targetNode) return '';
        
        return `M${sourceNode.x},${sourceNode.y}
                C${sourceNode.x},${(sourceNode.y + targetNode.y) / 2}
                 ${targetNode.x},${(sourceNode.y + targetNode.y) / 2}
                 ${targetNode.x},${targetNode.y}`;
      });

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: d3.D3DragEvent<SVGGElement, Node, Node>) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: d3.D3DragEvent<SVGGElement, Node, Node>) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: d3.D3DragEvent<SVGGElement, Node, Node>) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [gitState]);

  // Hàm lấy màu cho branch
  const getBranchColor = (branch: string) => {
    switch (branch) {
      case 'main':
        return '#3B82F6'; // Xanh dương
      case 'detached':
        return '#6B7280'; // Xám
      default:
        return '#8B5CF6'; // Tím
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {/* Working Directory */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card bg-base-200 shadow-xl"
        >
          <div className="card-body">
            <h3 className="card-title text-lg">Working Directory</h3>
            <div className="space-y-2">
              {gitState.workingDirectory.map((file) => (
                <motion.div
                  key={file.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 p-2 bg-base-300 rounded-lg"
                >
                  <span className={`badge ${
                    file.status === 'modified' ? 'badge-warning' :
                    file.status === 'untracked' ? 'badge-info' : 'badge-error'
                  }`}>
                    {file.status}
                  </span>
                  <span className="font-mono text-sm">{file.path}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Staging Area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card bg-base-200 shadow-xl"
        >
          <div className="card-body">
            <h3 className="card-title text-lg">Staging Area</h3>
            <div className="space-y-2">
              {gitState.stagingArea.map((file) => (
                <motion.div
                  key={file.path}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 p-2 bg-base-300 rounded-lg"
                >
                  <span className={`badge ${
                    file.status === 'added' ? 'badge-success' :
                    file.status === 'modified' ? 'badge-warning' : 'badge-error'
                  }`}>
                    {file.status}
                  </span>
                  <span className="font-mono text-sm">{file.path}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Current Branch */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card bg-base-200 shadow-xl"
        >
          <div className="card-body">
            <h3 className="card-title text-lg">Current Branch</h3>
            <div className="flex flex-wrap gap-2">
              {gitState.branches.map((branch) => (
                <motion.span
                  key={branch.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`badge ${
                    branch.name === gitState.currentBranch
                      ? 'badge-primary'
                      : 'badge-ghost'
                  } p-3`}
                >
                  {branch.name}
                </motion.span>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Git Graph */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card bg-base-200 shadow-xl"
        ref={containerRef}
      >
        <div className="card-body">
          <h3 className="card-title text-lg">Git Graph</h3>
          <svg
            ref={svgRef}
            className="w-full"
            style={{ minHeight: '400px' }}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default RepositoryVisualizer; 